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
    File.foreach(@source, external_encoding: "ISO-8859-1") do |line|
      @currentline = line
      self.send(@state)
    end
    self
  end
  def write 
    File.open(@destination, 'w') do |file|
      file.puts "---".encode("UTF-8")
      @yaml.each do|key_value|
        k, v = key_value
        v = "\"#{v}\"" if v =~ /[:.]/
        file.puts(("%s: %s" % [k, v]).encode("UTF-8"))
      end
      file.puts "---".encode("UTF-8")
      @savedlines.each {|line| file.puts line.encode("UTF-8")}
    end
    puts @destination
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
    when /<meta http-equiv="Content-Type" .*charset=([\w\-]+)/i
      @yaml['charset'] = $1

    when %r{<title>(.*) .thinair.</title>}
      @yaml['title'] = $1
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
task :write_posts do
  FileList['imported/thinair/*/*/*html']
    .exclude(/\/(index|\d+).html$/).each do |source|
    FSM.new(file).parse.write
  end
end

desc "copy static files to jekyll"
task :copy_static do
  copy_file = proc {|source|
      destination = source.gsub('imported', 'jekyll')
      dir = File.dirname(destination)
      #mkdir_p directory
      puts "cp_r #{source}, #{dir}"
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
end

desc "ensure posts are encoded in UTF-8"
task :encode_utf8 do
  FileList['jekyll/_posts-iso-8859-1/*html'].each do |source|
    destination = source.gsub('-iso-8859-1','')
    content = File.read(source)
    unless content.valid_encoding?
      content.force_encoding("ISO-8859-1");
    end
    unless content.encoding.name == "UTF-8"
      content.encode!("UTF-8")
    end
    content = content
      .gsub('charset: iso-8859-1', 'charset: UTF-8')
      .gsub('title: ', 'fulltitle: ')
    
    File.open(destination, 'w').write(content)
  end
end
