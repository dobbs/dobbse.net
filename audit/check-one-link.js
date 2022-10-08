export async function checkOneLink({href, post, label, type}) {
  const fetched = new Date().toJSON()
  if (!href) {
    return {href, type, post, label, fetched, ok: false, details: {
      error: "unsupported href",
      message: "cannot fetch empty href"
    }}
  }
  if (href.startsWith("#")) {
    return {href, type, post, label, fetched, ok: false, details: {
      error: "unsupported href",
      message: "cannot fetch hrefs that are only hash parameters"
    }}
  }
  if (href.startsWith("mailto:")) {
    return {href, type, post, label, fetched, ok: false, details: {
      error: "unsupported href",
      message: "cannot fetch mailto hrefs"
    }}
  }
  const absoluteHref = new URL(href, "http://dobbse.net").toString()
  try {
    const res = await fetch(absoluteHref, {method: "HEAD"})
    const {ok, status, redirected, url} = res
    return {href, type, post, label, fetched, ok, details:{
      status, redirected, url:url.toString(), absoluteHref
    }}
  } catch (error) {
    const {name, message} = error
    return {href, type, post, label, fetched, ok: false, details: {
      error: name, message, absoluteHref
    }}
  }
}
