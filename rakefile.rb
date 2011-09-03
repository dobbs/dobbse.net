
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
