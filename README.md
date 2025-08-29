# what worked 2023-05-05:

``` bash
docker run \
--name jekyll \
-it \
-v $PWD:/dobbse.net \
-w /dobbse.net \
ruby:2.6-buster bash
```

OR

``` bash
docker start jekyll  # existing container was already present and stopped
docker exec -it jekyll bash
```

Once inside the container

``` bash
cd jekyll
bundle install
bundle exec jekyll build
```

# reviewing locally with deno's file_server
``` bash
file_server -p 1080 jekyll/_site
```

# publishing

Indra's net switched to cPanel.

- create the tarball

    (cd ~/workspace/dobbs/dobbse.net/jekyll/_site;
     tar zcf ../../dobbse.net-$(date +%Y-%m-%d).tgz .)

- upload to cPanel home directory
- use cPanel file manager to expand the tarball into public_html

# analyzing structure of jekyll/_posts

I used a vaguely test-driven approach to discover the existing
structure and to transform that structure to fit some jekyll site
templates out on the internet. The test cases here encode what I've
learned about my library of blog posts and some rules I want to remain
true as I resume writing.

To run all the tests:
``` bash
deno test --allow-read
```

# index maintenance

For example, I have a test to verify consistency of posts and indexes.

I verify that there are year and month indexes for every post. Where
there are missing index files, I also emit a short shell script to
create the missing file.

(This might want to grow up to be a script that runs unconditionally
as a pre-commit hook, but I'm not quite ready to commit to that
automation. I'll wait to feel if this current hack hurts enough to
make it worth more effort here.)

## handling missing indexes

One way to fix these is to run the tests as described above and
copy-n-paste the shell commands to create the missing indexes.
Another way is to run the build and compare the source folders in the
thinair directory with the generated one in _site.

``` bash
bundle exec jekyll build
```

Inspect if there are any new month and year folders.

``` bash
comm -13 <(find thinair -type d) <(cd _site; find thinair -type d)
```

Generate month and year folders and index templates.

``` bash
comm -13 <(find thinair -type d) <(cd _site; find thinair -type d) | \
perl -F/ -lane 'use File::Path qw(make_path); shift(@F); my $x=join("-", @F); my $FH=qq{./$_/index.html}; make_path($_); open(FH, ">",$FH); print FH "---\n", "layout: periodic\n", $x=~/-/ ? "month" : "year", qq{: "$x"\n}, "---"'
```

Whichever way you fix the indexes, you'll need to re-run the build to
generate the index files from the new templates

``` bash
bundle exec jekyll build
```

# link maintenance

Many links on my site are currently broken. I'm building some tools to
help me find broken links and fix them. Hoping to make maintenance of
links easier.

This script makes HEAD requests to 100 links STDOUT is yaml data
structure which we append to `./link-cache-log.yaml`

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
