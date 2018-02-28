# what I tried 2018-02-27:

``` bash
docker run --name jekyll -it \
  -v ~/.ssh/config:/root/.ssh/config \
  -v ~/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v $PWD:/dobbse.net \
  -w /dobbse.net \
  ruby bash

apt-get update
apt-get install -y build-essential rsync
bundle install
gem install rake
rake jekyll
rake publish
```

`rake publish` failed.  Not sure why.
