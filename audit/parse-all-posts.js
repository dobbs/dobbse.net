import {join} from "https://deno.land/std@0.144.0/path/mod.ts"
import {
  parse,
  stringify,
} from "https://deno.land/std@0.144.0/encoding/yaml.ts";

export function parseAllPosts() {
  const {readDirSync, readTextFileSync} = Deno
  let dir = './jekyll/_posts'
  let files = readDirSync(dir)
  let audit = {headers: {}, rows:[]}
  for (let {name, isFile, isDirectory} of files) {
    let filepath = join(dir, name)
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
