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

# link maintenance

Many links on my site are currently broken. I'm building some tools to
help me find broken links and fix them. Hoping to make maintenance of
links easier.

This script makes HEAD requests to 100 links, in batches of about 4
per second. STDOUT is yaml data structure which we append to
`./link-cache-log.yaml`

``` bash
deno run --allow-read --allow-net audit/broken-links.js | \
  tee -a ./link-cache-log.yaml
```

## deno REPL

compare cache with link inventory

``` bash
deno repl
import {loadCache} from "./audit/load-cache.js"
let cache = loadCache()
import {linkInventory} from "./audit/link-inventory.js"
let links = await linkInventory()
links.length == cache.length
cache.filter(it => !it.ok).length
```

try testing a few links

``` bash
deno repl
import {main} from "./audit/broken-links.js"
main(5) // check on the next five links from inventory that are not in cache
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
