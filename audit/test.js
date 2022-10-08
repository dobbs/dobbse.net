import {dirname, fromFileUrl, resolve} from "https://deno.land/std@0.144.0/path/mod.ts"
import {
  assert,
  assertEquals
} from "https://deno.land/std@0.144.0/testing/asserts.ts"
import {
  DOMParser,
  initParser,
} from "https://deno.land/x/deno_dom/deno-dom-wasm-noinit.ts"
const {test} = Deno

import {parseAllPosts} from "./parse-all-posts.js"

const db = parseAllPosts()

test(function counts_of_headers() {
  assertEquals(
    db.headers,
    {
      title: 232,
      layout: 232,
      link: 232,
      date: 232,
      scripts: 4
    }
  )
})

test(function every_post_has_link() {
  assert(db.rows.every(({headers:{link}}) => !!link))
})

test(function no_posts_have_article_class() {
  assert(db.rows.every(({body}) => !body.match(/class="article"/)))
})

test(function no_posts_are_templated() {
  assert(db.rows.every(({body}) => !body.match(/{{ page\.link }}/)))
})

test(function no_posts_use_article_tag() {
  assert(db.rows.every(({body}) => !body.startsWith('<article')))
})

test(function every_post_layout_is_post() {
  assert(db.rows.every(({headers:{layout}}) => layout == 'post'))
})

test(function no_post_has_empty_comments() {
  let re=/\s<div class="section comments"><a name="comments"><\/a>\s+<\/div>\s+\z/
  assert(db.rows.every(({body}) =>!body.match(re)))
})

test(function no_post_has_comments_header() { // used to, but don't anymore
  assert(db.rows.every(({headers:{comments}}) => !comments))
})

test(function only_two_posts_end_with_closing_div() {
  assertEquals(
    db.rows
      .filter(({body}) => body.endsWith("\n</div>\n"))
      .map(({name}) => name)
      .sort(),
    [
      "2011-01-24-phone-turtle.html",
      "2011-12-22-turtle-geometry-exercises.html",
    ]
  )
})

test(function only_four_posts_have_extra_script_tags() {
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

test(function posts_with_comments_do_not_have_a_stray_div() {
  assert(
    db.rows
      .filter(({body}) => body.match(/class="comments"/))
      .every(({body}) => !body.match(/<\/div>\s+<section class="comments">/m))
  )
})

test(function all_local_images_addressed_https() {
  assertEquals(
    db.rows
      .filter((({body}) => body.match(/<img/)))
      .map(({name, body}) => {
        let _,x
        const images = body.match(/<img.*?src=".+?".*?>/mg)
              .map(img => ([_,x]=img.match(/src="(.+?)"/), x))
        return [name, ...(images.sort())]
      })
      .sort(),
    [
      [
        "2003-03-20-spring.html",
        "https://dobbse.net/images/spring-small.jpg",
      ],
      [
        "2003-07-19-use-a-better-browser.html",
        "https://giantfightingrobots.com/betterbrowser.gif",
      ],
      [
        "2004-07-15-finger-pointing.html",
        "https://dobbse.net/thinair/2004/05/finger-pointing.gif",
      ],
      [
        "2004-10-03-pcd-lessons.html",
        "https://dobbse.net/thinair/2004/10/figures.gif",
      ],
      [
        "2007-06-11-photosynth.html",
        "https://dobbse.net/thinair/2007/06/notre_dame.png",
        "https://dobbse.net/thinair/2007/06/notre_dame_cones_of_vision.png",
      ],
      [
        "2008-12-09-growth-and-polygons.html",
        "https://dobbse.net/thinair/2008/12/rainbow.png",
      ],
      [
        "2008-12-29-logo-fractals-recursion.html",
        "https://dobbse.net/thinair/2008/12/peano-012.png",
        "https://dobbse.net/thinair/2008/12/peano-4.png",
        "https://dobbse.net/thinair/2008/12/sam-curve-1.png",
        "https://dobbse.net/thinair/2008/12/sam-curve-2.png",
        "https://dobbse.net/thinair/2008/12/sam-curve-3.png",
        "https://dobbse.net/thinair/2008/12/sam-curve-4.png",
        "https://dobbse.net/thinair/2008/12/vkzig-1.png",
        "https://dobbse.net/thinair/2008/12/vkzig-2.png",
        "https://dobbse.net/thinair/2008/12/vkzig-6.png",
        "https://dobbse.net/thinair/2008/12/vonkoch-012.png",
        "https://dobbse.net/thinair/2008/12/vonkoch-345.png",
        "https://dobbse.net/thinair/2008/12/vonkoch-67.png",
        "https://dobbse.net/thinair/2008/12/vonkoch-snowflake.png",
      ],
      [
        "2009-09-19-punksnotdead.html",
        "https://dobbse.net/thinair/2009/09/punksnotdead.png",
      ],
      [
        "2009-10-29-blizzard.html",
        "https://dobbse.net/thinair/2009/10/labyrinth-1.jpg",
        "https://dobbse.net/thinair/2009/10/labyrinth-2.jpg",
        "https://dobbse.net/thinair/2009/10/labyrinth-3.jpg",
      ],
      [
        "2010-08-17-computational-education-map.html",
        "https://dobbse.net/thinair/2010/08/computational-education.png",
      ],
      [
        "2011-01-24-phone-turtle.html",
        "https://dobbse.net/thinair/2011/01/phone-turtle.png",
      ],
      [
        "2012-12-18-help-visualize-invisible.html",
        "https://dobbse.net/thinair/2012/12/figures.jpg",
        "https://dobbse.net/thinair/2012/12/rotunda.jpg",
        "https://dobbse.net/thinair/2012/12/u-of-v.jpg",
      ],
      [
        "2014-02-04-wish-you-were-here.html",
        "https://dobbse.net/thinair/2014/02/wish-you-were-here.jpg",
      ],
      [
        "2015-05-06-emotion-reason-riot-revolution.html",
        "https://dobbse.net/thinair/2015/05/medium_13_17_09_13_6_25_25_139532434.jpeg",
      ],
    ]
  )
})

test(async function all_posts_are_indexed_by_month_and_year() {
  const exists = file => Deno.stat(file)
        .then(() => true)
        .catch(error => {
          if (error instanceof Deno.errors.NotFound) {
            return false
          }
          throw error
        })
  const seen = new Set()
  const fix = []
  for(let {name} of db.rows) {
    let [ignore, year, month] = name.match(/^(\d{4})-(\d{2})-\d{2}-/)
    let yearIndex = resolve(
      dirname(fromFileUrl(import.meta.url)),
      "..", "jekyll", "thinair", year, "index.html")
    let monthIndex = resolve(
      dirname(fromFileUrl(import.meta.url)),
      "..", "jekyll", "thinair", year, month, "index.html")
    if (!seen.has(yearIndex)) {
      seen.add(yearIndex)
      if (! await exists(yearIndex)) {
        fix.push({filename: yearIndex, header: `year: "${year}"`})
      }
    }
    if (!seen.has(monthIndex)) {
      seen.add(monthIndex)
      if (! await exists(monthIndex)) {
        fix.push({filename: monthIndex, header: `month: "${year}-${month}"`})
      }
    }
  }

  for(let {filename, header} of fix.sort()) {
    console.log(`mkdir -p ${dirname(filename)}
cat <<EOF > ${filename}
---
layout: periodic
${header}
---
EOF
`)
  }

  assertEquals(fix, [])
})
