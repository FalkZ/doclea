import { Octokit } from '@octokit/core'
import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import { Result } from '../lib/utilities'
import { parseUrl } from '../lib/utilities/url'
import { GithubDirectoryEntry } from './GithubDirectoryEntry'
import type { SFError } from '../lib/SFError'
import type {
  StorageFrameworkProvider,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'

const guid = 'github-auth-reiupkvhldwe'
const github_client_id = 'github-client_id'
const github_client_secret = 'github-client_secret'

if (window.location.hash === '#' + guid) {
  if (window.location.search.startsWith('?code')) {
    console.log(
      'received code',
      new URLSearchParams(window.location.search).get('code')
    )
    const code = new URLSearchParams(window.location.search).get('code')

    const params = new URLSearchParams({
      client_id: 'b0febf46067600eed6e5',
      client_secret: '228480a8a7eae9aed8299126211402f47c488013',
      redirect_uri: `http://127.0.0.1:3000#${guid}`,
      code: code
    })

    void fetch('https://github.com/login/oauth/access_token?' + params, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      }
    })
      .then((response) => {
        if (!response.ok) console.error('failed fetch', response)
        return response.json()
      })
      .then((json) => {
        console.log('global - the token: ', json.access_token)
        sessionStorage.setItem(guid, json.access_token)
      })
  }
}

/**
 * Contains all methods for GithubFileSystem
 */
export class GithubFileSystem implements StorageFrameworkProvider {
  public readonly isSignedIn: boolean
  private token

  public static owner: string
  public static repo: string
  constructor({
    clientId,
    clientSecret
  }: {
    clientId: string
    clientSecret: string
  }) {
    sessionStorage.setItem(github_client_id, clientId)
    sessionStorage.setItem(github_client_secret, clientSecret)

    this.token = sessionStorage.getItem(guid)
    console.log('constructor() - the token: ', this.token)
    this.isSignedIn = !this.token
  }

  /**
   * Runs authentication process of github
   */
  authenticate() {
    const params = new URLSearchParams({
      client_id: GithubFileSystem.client_id,
      redirect_uri: `http://127.0.0.1:3000#${guid}`,
      scope: 'repo'
    })

    window.location.href = 'https://github.com/login/oauth/authorize?' + params

    console.log('never called')
  }

  octokit: Octokit

  /**
   * Opens github entry
   * @param {string} url to github repo
   * @returns {StorageFrameworkEntry} on success
   * @returns {SFError} on error
   */
  open(githubUrl: string): Result<StorageFrameworkEntry, SFError> {
    let githubPathFragments = parseUrl(githubUrl).pathFragments
    let fragmentSize = githubPathFragments.length
    GithubFileSystem.repo = githubPathFragments[fragmentSize - 1]
    GithubFileSystem.owner = githubPathFragments[fragmentSize - 2]

    this.token = sessionStorage.getItem(guid)
    console.log('open() - the token: ', this.token)
    console.log('GitHub open!')
    return new Result(async (resolve, reject) => {
      this.octokit = new Octokit({
        auth: this.token, // https://github.com/settings/tokens
        userAgent: 'doclea',

        baseUrl: 'https://api.github.com',

        log: {
          debug: console.debug,
          info: console.info,
          warn: console.warn,
          error: console.error
        }
      })

      const workspace = new GithubDirectoryEntry(null, '', '', this.octokit)
      workspace.getChildren()
      resolve(new ReactivityDirDecorator(null, workspace))
    })
  }
}

if (window.location.hash === '#' + guid) {
  if (window.location.search.startsWith('?code')) {
    console.log(
      'received code',
      new URLSearchParams(window.location.search).get('code')
    )
    const code = new URLSearchParams(window.location.search).get('code')

    const client_id = sessionStorage.getItem(github_client_id)
    const client_secret = sessionStorage.getItem(github_client_secret)

    const params = new URLSearchParams({
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: `http://127.0.0.1:3000#${guid}`,
      code: <string>code
    })

    void fetch('https://github.com/login/oauth/access_token?' + params, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      }
    })
      .then((response) => {
        if (!response.ok) console.error('failed fetch', response)
        return response.json()
      })
      .then((json) => {
        console.log('global - the token: ', json.access_token)
        sessionStorage.setItem(guid, json.access_token)
      })
  }
}
