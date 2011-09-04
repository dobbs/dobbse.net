class FSM
  def initialize(filename)
    nextstate(:head)
    @yaml = {}
    @yaml['layout'] = 'default'
    @savedlines = []
    @source = filename
    @destination
    @currentline = ""
    self
  end
  def parse
    linenumber = 1;
    begin
      File.open(@source, 'r:ISO-8859-1:UTF-8').each_line do |line|
        linenumber += 1
        @currentline = line
        self.send(@state)
      end
    rescue => e
      puts "error parsing #{@source}:#{linenumber}\n#{e}\n"
    end
    self
  end
  def save 
    unless @destination
      puts "skipped #{@source}"
      return self 
    end
    require 'yaml'
    File.open(@destination, 'w:UTF-8') do |file|
      file.puts(YAML.dump(@yaml))
      file.puts "---"
      @savedlines.each {|line| file.puts line}
    end
    self
  end
  private
  def saveline
    @savedlines << @currentline 
  end
  def nextstate(symbol) 
    @state = symbol 
  end
  def head
    case @currentline
    when /<\!DOCTYPE html PUBLIC/i
      nextstate(:ignore)
    when /<meta http-equiv="Content-Type" .*charset=([\w\-]+)/i
      @yaml['charset'] = 'UTF-8'
    when %r{<title>(.*) .thinair.</title>}
      @yaml['fulltitle'] = $1
    when /<div class="article">/
      saveline
      nextstate(:savepubdate)
    end
  end
  def savepubdate
    saveline
    if @currentline =~ /([\d\-T:]+) pubdate/
      @yaml['posted'] = $1
      @destination ||= "jekyll/_posts/#{$1.gsub(/T.*/, '')}-#{File.basename(@source)}"
      nextstate(:savearticle)
    end
  end
  def savearticle
    @currentline =~ /<div class="nav">/ ? nextstate(:ignore) : saveline
  end
  def ignore
  end
end

desc "copy html files from host"
task :import do
  excludes = %w[.imap cat_*.html .DS_Store ._* *~ \d\d\d\.xml mt-static]
    .map {|ex| "--exclude '#{ex}'"}.join(' ')
  sh "rsync -avz #{excludes} dobbse-host:www/html/ imported"
end

desc "create jekyll-named posts from html files in imported directory"
task :save_posts do
  FileList['imported/thinair/*/*/*html']
    .exclude(/\/(index|\d+).html$/).each do |source|
    FSM.new(source).parse.save
  end
end

desc "copy static files to jekyll"
task :copy_static do
  copy_file = proc {|source|
      destination = source.gsub('imported', 'jekyll')
      dir = File.dirname(destination)
      mkdir_p dir
      cp_r source, dir, preserve: true
  }
  FileList['imported/thinair/*/*/*'].exclude(/.html$/)
    .add('imported/*')
    .exclude('imported/thinair', /.(atom|opml|htmlx|rdf|xml)$/).each do |source|
    if source =~ /(^|\/)_/
      puts "skipping '#{source}' to prevent potential collisions with jekyll"
    else
      copy_file.call(source)
    end
  end
  FileList['imported/thinair/*/*/index.html'].each &copy_file
end

desc "clean static files in jekyll"
task :clean_static do
  FileList['imported/*']
    .exclude('imported/thinair', /.(atom|opml|html|htmlx|rdf|xml)$/).each do |source|
    rm_rf source.sub('imported', 'jekyll')
  end
end

desc "generate site with jekyll"
task :jekyll do
  chdir "jekyll" do
    sh "jekyll"
  end
  cp 'imported/.htaccess', 'jekyll/_site', preserve: true
  chdir 'jekyll/_site/resume' do
    ln_s 'eric-dobbs.pdf', 'eric_dobbs.pdf' unless File.symlink? 'eric_dobbs.pdf'
    ln_s 'eric-dobbs.html', 'index.html' unless File.symlink? 'index.html'
  end
end

desc "publish _site to host"
task :publish do
  sh "rsync -avz jekyll/_site/ dobbse-host:www/html/"
end
