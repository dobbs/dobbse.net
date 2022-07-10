import {loadCache} from "./load-cache.js"
import {serve} from "https://deno.land/std@0.147.0/http/server.ts"
import {stringify} from "https://deno.land/std@0.144.0/encoding/yaml.ts"

let cache = await loadCache()
let posts = cache.reduce((collection, {href, post, label, details, ok, fetched}) => {
  let links = collection.get(post) || []
  links.push({href,label,ok,fetched,details})
  collection.set(post, links)
  return collection
}, new Map())

serve(async req => {
  let url = new URL(req.url)
  console.log({url: url.toString(), pathname: url.pathname})
  if (url.pathname  == "/") {
    let html = ''
    for (let post of [...posts.keys()].sort()) {
      html += `<p><a href="/${post}">${post}</a></p>\n`
    }
    return new Response(html, {headers: {'Content-type': 'text/html'}})
  } else if (posts.get(url.pathname.substring(1))) {
    return new Response(stringify(posts.get(url.pathname.substring(1))))
  } else {
    return new Response(stringify({pathname: url.pathname}))
  }
})
