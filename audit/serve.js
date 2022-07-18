import {loadCache} from "./load-cache.js"
import {serve} from "https://deno.land/std@0.147.0/http/server.ts"
import {stringify} from "https://deno.land/std@0.144.0/encoding/yaml.ts"

let cache = await loadCache()
let posts = cache.reduce((collection, {href, post, label, details, ok, fetched}) => {
  const pathname = `/${post}`
  const links = collection.get(pathname) || []
  links.push({href,label,ok,fetched,details})
  collection.set(pathname, links)
  return collection
}, new Map())

serve(async req => {
  let url
  try {
    url = new URL(req.url)
    if (url.pathname  == "/") {
      let html = ''
      for (let pathname of [...posts.keys()].sort()) {
        html += `<p><a href="${pathname}">${pathname}</a></p>\n`
      }
      return new Response(html, {headers: {'Content-type': 'text/html'}})
    } else if (posts.get(url.pathname)) {
      return new Response(stringify(posts.get(url.pathname)))
    } else {
      return new Response(stringify({pathname: url.pathname}))
    }
  } catch (error) {
    return new Response(error.message, {
      status: 500,
      statusText: error.message
    })
  } finally {
    console.log({url: url.toString(), pathname: url.pathname})
  }
})
