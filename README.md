# what worked 2022-06-18:

``` bash
rm Gemfile.lock
bundle install --path vendor/bundle
rake jekyll
```

# analyzing structure of jekyll/_posts

Using a vaguely test-driven approach to discover the existing
structure with a view of transforming that structure to fit some
jekyll site templates out on the internet. The test cases here encode
what I've learned about my library of blog posts.

``` bash
deno test --allow-read audit/test.js
```

An inventory of outbound links:

``` bash
deno run --allow-read audit/broken-links.js
```

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
