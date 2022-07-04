import {uniqueKeyForLink} from "./link-inventory.js"
import {dirname, fromFileUrl, resolve} from "https://deno.land/std@0.144.0/path/mod.ts"
import {parse} from "https://deno.land/std@0.144.0/encoding/yaml.ts"
const {readTextFileSync} = Deno

export function loadCache(filename=null) {
  if (filename == null) {
    filename = resolve(
      dirname(fromFileUrl(import.meta.url)),
      "..",
      "link-cache-log.yaml"
    )
  }
  let rawcache
  try {
    rawcache = parse(readTextFileSync(filename))
  } catch(error) {
    if (error.name != "NotFound") {
      throw error
    }
    rawcache = []
  }
  const seen = new Set()
  const cache = rawcache.filter(row => {
    let k = uniqueKeyForLink(row)
    return seen.has(k) ? false : seen.add(k)
  })
  return cache
}
