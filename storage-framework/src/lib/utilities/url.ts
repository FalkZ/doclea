class URLUtil extends URL {
  get pathFragments(): string[] {
    return this.pathname.substring(1).split('/')
  }
}

export const parseUrl = (url: string): URLUtil => new URLUtil(url)

export const hasSearchParam = (param: string): boolean =>
  new URLSearchParams(window.location.search).has(param)

export const getAndRemoveSearchParam = (param: string): string | null => {
  const params = new URLSearchParams(window.location.search)
  if (!params.has(param)) return null
  const p = params.get(param)
  params.delete(param)

  const url = new URL(window.location.toString())
  url.search = params.toString()

  window.history.pushState({}, '', url)

  return p
}
