import { Octokit } from '@octokit/core'
import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import { Result, type OkOrError } from '../lib/utilities'
import {
  getAndRemoveSearchParam,
  hasSearchParam,
  parseUrl
} from '../lib/utilities/url'
import { GithubDirectoryEntry } from './GithubDirectoryEntry'
import type { SFError } from '../lib/SFError'
import type { SFProviderAuth } from '../lib/new-interface/SFProvider'
import { Signal } from './Signal'
import { GitHubAPI } from './GithubApi'
import { TransactionalDirectoryEntry } from '../lib/wrappers/TransactionalDirectoryEntry'

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
    if (!localStorage.getItem(STARTED_GITHUB_AUTH) && !hasSearchParam('code')) {
      localStorage.setItem(STARTED_GITHUB_AUTH, '1')
      const redirectUri = (
        window.location.origin + window.location.pathname
      ).replace('localhost', '127.0.0.1')
      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: redirectUri,
        scope: 'repo'
      })

      window.location.href =
        'https://github.com/login/oauth/authorize?' + params
    }
  }

  /**
   * Opens github entry
   * @param {string} url to github repo
   * @returns {StorageFrameworkEntry} on success
   * @returns {SFError} on error
   */
  public open(githubUrl: string): Result<TransactionalDirectoryEntry, SFError> {
    const githubPathFragments = parseUrl(githubUrl).pathFragments

    const repo = githubPathFragments[1]
    const owner = githubPathFragments[0]

    const api = new GitHubAPI({ authToken: this.token, repo, owner })

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

      const workspace = new GithubDirectoryEntry(null, '', '', api)
      workspace.getChildren()

      resolve(new TransactionalDirectoryEntry(workspace))
    })
  }

  private checkToken() {
    const token = sessionStorage.getItem(TOKEN)
    if (token) {
      noop({ token })
      this.token = token
      this.isAuthenticated.resolve(true)
    } else if (hasSearchParam('code')) {
      if (hasSearchParam('code')) {
        const code = getAndRemoveSearchParam('code')

        const params = new URLSearchParams({
          client_id: 'b0febf46067600eed6e5',
          // client_secret: '228480a8a7eae9aed8299126211402f47c488013',
          redirect_uri: `http://127.0.0.1:3000`,
          code: code
        })

        void fetch(
          'https://github-oauth-proxy-server.herokuapp.com?' + params,
          {
            method: 'POST'
          }
        )
          .then((response) => {
            if (!response.ok) {
              console.error('failed fetch', response)
              throw new Error()
            }
            return response.json()
          })
          .then((json) => {
            if (json.error) {
              console.error(json)
            } else {
              this.token = json.access_token
              if (this.token) {
                sessionStorage.setItem(TOKEN, this.token)

                this.isAuthenticated.resolve(true)
              }
            }
          })
          .finally(() => {
            localStorage.removeItem(STARTED_GITHUB_AUTH)
          })
      } else {
        this.isAuthenticated.resolve(false)
      }
    } else {
      localStorage.removeItem(STARTED_GITHUB_AUTH)
      this.isAuthenticated.resolve(false)
    }
  }
}
