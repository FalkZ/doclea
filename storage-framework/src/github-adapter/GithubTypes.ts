export type GithubResponse =  ArrayResponse | SingleFile | Directory

export type ArrayResponse = (File | Directory)[]

interface GithubContent {
  size: number
  name: string
  path: string
  sha: string
  url: string
  git_url: string
  html_url: string
}
export interface SingleFile extends GithubContent {
  type: 'file'
  content: string
  download_url: string
}

export interface File extends GithubContent {
  type: 'file'
  download_url: string
}

export interface Directory extends GithubContent {
  type: 'dir'
}
