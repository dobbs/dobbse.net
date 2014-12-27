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
  chdir 'jekyll/_site/resume' do
    ln_s 'eric-dobbs.pdf', 'eric_dobbs.pdf' unless File.symlink? 'eric_dobbs.pdf'
    ln_s 'eric-dobbs.html', 'index.html' unless File.symlink? 'index.html'
  end
end

desc "publish _site to host"
task :publish do
  sh "rsync -avz jekyll/_site/ dobbse-host:www/html/"
end
