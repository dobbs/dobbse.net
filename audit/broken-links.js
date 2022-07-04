import * as path from "https://deno.land/std@0.144.0/path/mod.ts"
import {
  DOMParser,
  initParser,
} from "https://deno.land/x/deno_dom/deno-dom-wasm-noinit.ts";
import {stringify} from "https://deno.land/std@0.144.0/encoding/yaml.ts";
import { delay } from 'https://deno.land/x/delay@v0.2.0/mod.ts';
const {readDirSync, readTextFileSync} = Deno


import {loadCache} from "./load-cache.js"
import {parseAllPosts} from "./parse-all-posts.js"

const db = parseAllPosts()
const cache = loadCache()
await initParser()
const {parseFromString} = new DOMParser()

db.rows.forEach(row => row.dom = parseFromString(row.body, 'text/html'))

export const inventory = db.rows.reduce((acc, {name, dom}) => {
  Array.from(dom.querySelectorAll("a[href]")).forEach(link => {
    let href = link.getAttribute('href')
    const label = link.textContent.trim()
    if (href &&
        !href.startsWith('mailto') &&
        !href.startsWith('#') &&
        !cache.find(row => row.href == href && row.post == name)
       ) {
      href = new URL(href, "http://dobbse.net"),
      acc.push({
        href,
        label,
        post: name,
        check: async () => await fetch(href, {method: "HEAD"}).then(res => ({
          href, label, post: name,
          ok: res.ok,
          status: res.status,
          redirected: res.redirected,
          url: res.url
        }))
      })
    }
  })
  return acc
}, [])

export function* byFour(arr) {
  const it = arr.values()
  while (!it.done) {
    yield Array.from({length: 4}, () => it.next().value)
  }
}

async function checkInventory() {
  for (let group of byFour(inventory.slice(0,4*25))) {
    let settledGroup = (await Promise.allSettled(group.map(({
      href, label, post, check
    }={check:()=>Promise.reject("missing check function")}) => {
      return check().catch(error => ({
        href, label, post,
        error: `${error.name}:${error.message}`}))
    }))).map(({status, value}) => {
      return {...value, href: (value.href || "").toString(), promiseStatus: status || "unknown"}
    })
    console.log(stringify(settledGroup))
    await delay(500 + Math.floor(1000*Math.random()))
  }
}

await checkInventory()
