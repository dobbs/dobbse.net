desc "print the formated date and time and copy to the clipboard"
task :date do
  sh "date +'%Y-%m-%dT%H:%M:%S' | pbcopy"
end

desc "generate site with jekyll"
task :jekyll do
  chdir "jekyll" do
    sh "jekyll build"
    cp '.htaccess', '_site', preserve: true
  end
end

desc "publish _site to host"
task :publish do
  sh "rsync -avz jekyll/_site/ dobbse-host:www/html/"
end
