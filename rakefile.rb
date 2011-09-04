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
      File.open(@source, 'r:ISO-8859-1').each_line do |line|
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
    File.open(@destination, 'w') do |file|
      file.puts(YAML.dump(@yaml).encode("UTF-8"))
      file.puts "---".encode("UTF-8")
      @savedlines.each {|line| file.puts line.encode("UTF-8")}
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
      cp_r source, dir
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

desc "generate site with jekyll"
task :jekyll do
  chdir "jekyll"
  sh "jekyll"
  chdir ".."
  cp 'imported/.htaccess', 'jekyll/_site'
end
