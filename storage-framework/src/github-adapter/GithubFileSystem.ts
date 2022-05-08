import { Octokit } from '@octokit/core'
import { SFError } from '../lib/SFError'
import {
  StorageFrameworkProvider,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import { Result } from '../lib/utilities'
import { GithubDirectoryEntry } from './GithubDirectoryEntry'
import type { GithubResponse } from './GithubTypes'

const guid = 'github-auth-reiupkvhldwe'

if (window.location.hash === '#' + guid) {
  if (window.location.search.startsWith('?code')) {
    console.log(
      'received code',
      new URLSearchParams(window.location.search).get('code')
    )
    const code = new URLSearchParams(window.location.search).get('code')

    const params = new URLSearchParams({
      client_id: 'b0febf46067600eed6e5',
      client_secret: '44e2e6e329257ae5c2196d920bfe91ee43184c3d ',
      // redirect_uri: `http://127.0.0.1:3000#${guid}`,
      redirect_uri: 'http://127.0.0.1:3000#${guid}',
      code: code
    })

    fetch('https://github.com/login/oauth/access_token?' + params, {
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
        console.log('received token', json)
        sessionStorage.setItem(guid, json.token)
      })
  }
}

export class GithubFileSystem implements StorageFrameworkProvider {
  isSignedIn: boolean
  private token

  constructor() {
    this.token = sessionStorage.getItem(guid)
    this.isSignedIn = this.token ? true : false
  }

  authenticate() {
    const params = new URLSearchParams({
      client_id: 'b0febf46067600eed6e5',
      // redirect_uri: window.location.origin,
      // redirect_uri: window.location.href,
      redirect_uri: `http://127.0.0.1:3000#${guid}`,
      scope: 'repo'
    })

    window.location.href = 'https://github.com/login/oauth/authorize?' + params

    console.log('never called')
  }

  static readonly config = {
    owner: 'mikko-abad',
    repo: 'doclea'
  }

  octokit: Octokit

  open(): Result<StorageFrameworkEntry, SFError> {
    console.log('GitHub open!')
    return new Result((resolve, reject) => {
      this.token = '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'
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

      let workspace = new GithubDirectoryEntry(null, '', '', this.octokit)
      workspace.getChildren()
      resolve(workspace)
    })
  }
}
