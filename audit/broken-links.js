import {
  DOMParser,
  initParser,
} from "https://deno.land/x/deno_dom/deno-dom-wasm-noinit.ts";

import {parseAllPosts} from "./parse-all-posts.js"

const db = parseAllPosts()
await initParser()
const {parseFromString} = new DOMParser()

db.rows.forEach(row => row.dom = parseFromString(row.body, 'text/html'))

const inventory = db.rows.reduce((acc, {name, dom}) => {
  Array.from(dom.querySelectorAll("a[href]")).forEach(link => {
    const href = link.getAttribute('href')
    const label = link.textContent.trim()
    if (href &&
        !href.startsWith('mailto') &&
        !href.startsWith('#')) {
      acc.push({
        href: new URL(href, "http://dobbse.net"),
        label,
        post: name
      })
    }
  })
  return acc
}, [])

console.log(JSON.stringify(inventory, null, 2))
