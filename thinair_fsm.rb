class FSM
  def initialize(filename)
    @source = filename
    nextstate(:head)
    @yaml = {}
    @yaml['layout'] = 'default'
    @savedlines = []
    @destination
    @currentline = ""
    self
  end
  def parse
    File.open(@source, 'r:UTF-8:ISO-8859-1').each_line do |line|
      @currentline = line
      self.send(@state)
    end
    self
  end
  def save 
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
    puts "#{@source} : #{symbol}"
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
