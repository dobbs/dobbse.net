import {
  DOMParser,
  initParser,
} from "https://deno.land/x/deno_dom/deno-dom-wasm-noinit.ts";
import {parseAllPosts} from "./parse-all-posts.js"

// Trade-off decision in the definition of the key below.  This
// code will check links once per page instead of once per
// run. I'm choosing that trade-off to make it easier to find
// the pages that need to be edited as a result of this
// inventory
export function uniqueKeyForLink({href, post}) {return `${post} -> ${href}`}

export async function linkInventory() {
  await initParser()
  const {parseFromString} = new DOMParser()
  const db = parseAllPosts()
  const seen = new Set()
  return db.rows.reduce((acc, row) => {
    const post = row.name
    const dom = parseFromString(row.body, 'text/html')
    dom.querySelectorAll("a[href]").forEach(link => {
      const href = link.getAttribute("href")
      const label = link.textContent.trim()
      const uniqueKey = uniqueKeyForLink({href, post})
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey)
        acc.push({href, label, post})
      }
    })
    return acc
  }, [])
}
