import { Octokit } from '@octokit/core'
import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import { Result, type OkOrError } from '../lib/utilities'
import { getAndRemoveSearchParam, hasSearchParam, parseUrl } from '../lib/utilities/url'
import { GithubDirectoryEntry } from './GithubDirectoryEntry'
import type { SFError } from '../lib/SFError'
import type { SFProviderAuth } from '../lib/new-interface/SFProvider'
import { Signal } from './Signal'

const guid = 'github-auth-reiupkvhldwe'

const STARTED_GITHUB_AUTH = 'STARTED_GITHUB_AUTH'
const TOKEN = 'TOKEN'

const noop = () => {}

/**
 * Contains all methods for GithubFileSystem
 */
export class GithubFileSystem implements SFProviderAuth {
  private token
  private readonly clientId
  private readonly clientSecret
  private octokit: Octokit

  public static owner: string
  public static repo: string
  public constructor({
    clientId,
    clientSecret
  }: {
    clientId: string
    clientSecret: string
  }) {
    this.clientId = clientId
    this.clientSecret = clientSecret

    this.checkToken()
  }

  public isAuthenticated = new Signal<boolean>()

  /**
   * Runs authentication process of github
   */
  public authenticate(): OkOrError<SFError> {
    sessionStorage.setItem(STARTED_GITHUB_AUTH, 'true')
    const redirectUri = window.location.href.replace('localhost', '127.0.0.1')
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'repo'
    })

    window.location.href = 'https://github.com/login/oauth/authorize?' + params

    noop('never called')
  }

  /**
   * Opens github entry
   * @param {string} url to github repo
   * @returns {StorageFrameworkEntry} on success
   * @returns {SFError} on error
   */
  public open(githubUrl: string): Result<Entry, SFError> {
    const githubPathFragments = parseUrl(githubUrl).pathFragments

    GithubFileSystem.repo = githubPathFragments[1]
    GithubFileSystem.owner = githubPathFragments[0]

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
      resolve(workspace)
    })
  }

  private checkToken() {
    const token = sessionStorage.getItem(TOKEN)
    if(token){
      noop({token})
      this.token = token;
      this.isAuthenticated.resolve(true)
    }
    else if (sessionStorage.getItem(STARTED_GITHUB_AUTH)) {
      sessionStorage.removeItem(STARTED_GITHUB_AUTH)
      if (hasSearchParam('code')) {
       
        const code = getAndRemoveSearchParam('code')

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
            this.token = json.access_token
            sessionStorage.setItem(TOKEN, this.token)
            noop({token})
            this.isAuthenticated.resolve(true)
          })
      } else {
        this.isAuthenticated.resolve(false)
      }
    } else {
      this.isAuthenticated.resolve(false)
    }
  }
// }

// if (window.location.hash === '#' + guid) {
//   if (window.location.search.startsWith('?code')) {
//     noop(
//       'received code',
//       new URLSearchParams(window.location.search).get('code')
//     )
//     const code = new URLSearchParams(window.location.search).get('code')

//     const client_id = sessionStorage.getItem(github_client_id)
//     const client_secret = sessionStorage.getItem(github_client_secret)

//     const params = new URLSearchParams({
//       client_id: client_id,
//       client_secret: client_secret,
//       redirect_uri: `http://127.0.0.1:3000#${guid}`,
//       code: code || ''
//     })

//     void fetch('https://github.com/login/oauth/access_token?' + params, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json'
//       }
//     })
//       .then((response) => {
//         if (!response.ok) console.error('failed fetch', response)
//         return response.json()
//       })
//       .then((json) => {
//         noop('global - the token: ', json.access_token)
//         sessionStorage.setItem(guid, json.access_token)
//       })
//   }
// }
