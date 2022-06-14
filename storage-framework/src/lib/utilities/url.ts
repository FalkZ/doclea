class URLUtil extends URL {
  get pathFragments(): string[] {
    return this.pathname.substring(1).split('/')
  }
}

export const parseUrl = (url: string): URLUtil => new URLUtil(url)
