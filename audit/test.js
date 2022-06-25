import {
  assert,
  assertEquals
} from "https://deno.land/std@0.144.0/testing/asserts.ts";
import {
  DOMParser,
  initParser,
} from "https://deno.land/x/deno_dom/deno-dom-wasm-noinit.ts";
// import {DOMParser} from "https://deno.land/x/deno_dom/deno-dom-native.ts"
import * as path from "https://deno.land/std@0.144.0/path/mod.ts"
import {
  parse,
  stringify,
} from "https://deno.land/std@0.144.0/encoding/yaml.ts";
const {test} = Deno

function parseAllPosts() {
  const {readDirSync, readTextFileSync} = Deno
  let dir = './jekyll/_posts'
  let files = readDirSync(dir)
  let audit = {headers: {}, rows:[]}
  for (let {name, isFile, isDirectory} of files) {
    let filepath = path.join(dir, name)
    if (isFile) {
      let content = readTextFileSync(filepath)
      let [ignore, head, body] = content.split(/--- *\n/)
      let headers = parse(head)
      for (let key in headers) {
        audit.headers[key] = (audit.headers[key] || 0) + 1
      }
      audit.rows.push({name, headers, body})
    }
  }
  return audit
}

const db = parseAllPosts()

test(function counts_of_headers() {
  assertEquals(
    db.headers,
    {
      title: 231,
      layout: 231,
      link: 9,
      date: 231,
      scripts: 4
    }
  )
})

test(function has_link_and_no_article() {
  assert(
    db.rows
      .filter(({headers}) => !!headers.link)
      .every(({body}) => !body.match(/class="article"/))
  )
})

test(function posts_without_link_are_not_templated() {
  assert(
    db.rows
      .filter(({headers}) => !headers.link)
      .every(({body}) => !body.match(/{{ page\.link }}/))
  )
})

test(function no_posts_use_article_tag() {
  assert(
    db.rows.every(({body}) => !body.startsWith('<article'))
  )
})

test(function four_posts_have_extra_script_tags() {
  assertEquals(
    db.rows
      .filter(({headers:{scripts}}) => !!scripts)
      .map(({name, headers:{scripts}}) => [name, ...scripts]),
    [
      [
        "2011-01-24-phone-turtle.html",
        "https://dobbs.github.io/turtle/turtle.min.js",
        "https://dobbs.github.io/turtle/fractal.js",
      ],
      [
        "2011-12-22-turtle-geometry-exercises.html",
        "http://code.jquery.com/jquery-1.7.1.min.js",
        "https://dobbs.github.io/turtle/turtle.min.js",
        "https://dobbs.github.io/turtle/tg.js",
      ],
      [
        "2012-03-18-programming-by-touch.html",
        "http://code.jquery.com/jquery-1.7.1.min.js",
      ],
      [
        "2010-12-03-javascript-turtle-graphics.html",
        "https://dobbs.github.io/turtle/turtle.min.js",
        "https://dobbs.github.io/turtle/fractal.js",
      ],
    ]
  )
})

test(function every_post_layout_is_post() {
  assert(
    db.rows.every(({headers:{layout}}) => layout == 'post')
  )
})

test(function no_post_has_empty_comments() {
  let re=/\s<div class="section comments"><a name="comments"><\/a>\s+<\/div>\s+\z/
  assert(db.rows.every(({body}) =>!body.match(re)))
})

test(function no_post_has_comments_header() { // used to, but don't anymore
  assert(db.rows.every(({headers:{comments}}) => !comments))
})

test(async function thirty_two_posts_have_comments() {
  await initParser()
  const {parseFromString} = new DOMParser()
  assertEquals(
    db.rows
      .reduce((acc, {name, body}) => {
        const document = parseFromString(body, 'text/html')
        const comments = Array.from(document.querySelectorAll('.comment'))
        if (comments.length > 0) {
          acc.push([name, comments.length])
        }
        return acc
      }, [])
      .sort(),
    [
      ["2002-10-16-software-development-profession.html", 2],
      ["2003-02-24-safari-bookmarks.html", 1],
      ["2003-03-11-oppose-invasion-of-iraq.html", 5],
      ["2003-04-09-prefer-non-violence.html", 2],
      ["2003-04-17-test-driving-idea.html", 1],
      ["2003-04-21-insurance-die-die-die.html", 1],
      ["2003-07-14-artists-self-publishing.html", 1],
      ["2003-08-05-please-fail-fast.html", 2],
      ["2003-08-11-master-apprentice-staff.html", 1],
      ["2003-09-11-scaffolding-and-architecture.html", 1],
      ["2003-10-02-rss-data-xml-data.html", 1],
      ["2003-10-10-fsm-bop.html", 1],
      ["2003-11-04-altitude-and-hard-drives.html", 3],
      ["2003-12-22-hiccups.html", 2],
      ["2004-01-19-SensoryIntegration.html", 3],
      ["2004-02-19-pdf-default.html", 4],
      ["2004-02-27-pdf-pot-luck.html", 11],
      ["2004-03-11-write.html", 1],
      ["2004-03-16-ol-coyote.html", 6],
      ["2004-03-25-political-introspection.html", 3],
      ["2004-04-21-t1.html", 1],
      ["2004-05-19-political-power-curve.html", 2],
      ["2004-05-27-functions-rising.html", 1],
      ["2004-05-28-revolution.html", 1],
      ["2004-06-15-js-form-vs-content.html", 1],
      ["2004-06-17-easy-full-text-search.html", 4],
      ["2004-07-14-election-2000-by-county.html", 1],
      ["2004-08-25-state-machine-example.html", 1],
      ["2004-09-12-overconsumption.html", 1],
      ["2004-10-26-vote.html", 2],
      ["2004-11-10-create-peace.html", 1],
      ["2004-12-03-welcome-home-elliott.html", 3],
    ]
  )
})

test(async function dom_structure_is_consistent_for_222_posts_without_links() {
  await initParser()
  const {parseFromString} = new DOMParser()
  assertEquals(
    db.rows
      .filter(({headers:{link}}) => !link)
      .map(({name, body}) => {
        const document = parseFromString(body, 'text/html')
        const article = document.querySelector('.article')
        const head = article.children[0]
        const date = article.children[1]
        return [
          `${head.tagName}>${head.firstChild.tagName}`,
          ...head.firstChild.getAttributeNames(),
          ...date.getAttributeNames(),
          date.classList[0], ...Array.from(date.classList).slice(2)
        ]
      }),
    Array.from({length: 222}, () => ["H1>A", "href", "class", "time", "pubdate", "meta"])
  )
})
