import {linkInventory, uniqueKeyForLink} from "./link-inventory.js"
import {checkOneLink} from "./check-one-link.js"
import {loadCache} from "./load-cache.js"
import {stringify} from "https://deno.land/std@0.144.0/encoding/yaml.ts"
import {delay} from 'https://deno.land/x/delay@v0.2.0/mod.ts'

export async function main(howmany=100) {
  const cache = new Set(loadCache().map(uniqueKeyForLink))
  const links = await linkInventory()
  for(let link of links) {
    const uniqueKey = uniqueKeyForLink(link)
    if (!cache.has(uniqueKey)) {
      howmany--
      cache.add(uniqueKey)
      let result = await checkOneLink(link)
      console.log(stringify([result]))
      if (howmany <= 0) {
        break
      }
      await delay(100 + Math.floor(200*Math.random()))
    }
  }
}

if (import.meta.main)
  await main(...Deno.args)
