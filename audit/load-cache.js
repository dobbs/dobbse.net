import {dirname, fromFileUrl, resolve} from "https://deno.land/std@0.144.0/path/mod.ts"
import {parse} from "https://deno.land/std@0.144.0/encoding/yaml.ts";
const {readTextFileSync} = Deno

export function loadCache(filename=null) {
  if (filename == null) {
    filename = resolve(
      dirname(fromFileUrl(import.meta.url)),
      "..",
      "link-cache-log.yaml"
    )
  }
  const rawcache = parse(readTextFileSync(filename))
  const seen = new Set()
  const cache = rawcache.filter(row => {
    let k = `${row.post} -> ${row.href}`
    return seen.has(k) ? false : seen.add(k)
  })
  return cache
}

export async function checkOneLink({href, post, label}) {
  const fetched = new Date.toJSON()
  try {
    const res = await fetch(href, {method: "POST"})
    const {ok, status, redirected, url} = res
    return {href, post, label, fetched, ok, details:{status, redirected, url}}
  } catch (error) {
    const {name, message} = error
    return {href, post, label, fetched, ok: false, details: {error: name, message}}
  }
}
