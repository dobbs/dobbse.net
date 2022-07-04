export async function checkOneLink({href, post, label}) {
  const fetched = new Date.toJSON()
  if (!href) {
    return {href, post, label, fetched, ok: false, details: {
      error: "unsupported href",
      message: "cannot fetch empty href"
    }}
  }
  if (href.startsWith("#")) {
    return {href, post, label, fetched, ok: false, details: {
      error: "unsupported href",
      message: "cannot fetch hrefs that are only hash parameters"
    }}
  }
  if (href.startsWith("mailto:")) {
    return {href, post, label, fetched, ok: false, details: {
      error: "unsupported href",
      message: "cannot fetch mailto hrefs"
    }}
  }
  const absoluteHref = new URL(href, "http://dobbse.net")
  try {
    const res = await fetch(absoluteHref, {method: "POST"})
    const {ok, status, redirected, url} = res
    return {href, post, label, fetched, ok, details:{
      status, redirected, url, absoluteHref
    }}
  } catch (error) {
    const {name, message} = error
    return {href, post, label, fetched, ok: false, details: {
      error: name, message, absoluteHref
    }}
  }
}
