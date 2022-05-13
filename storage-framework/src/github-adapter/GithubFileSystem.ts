import { Octokit } from '@octokit/core'
import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import { Result } from '../lib/utilities'
import { GithubDirectoryEntry } from './GithubDirectoryEntry'
import type { SFError } from '../lib/SFError'
import type {
  StorageFrameworkProvider,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
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

export class GithubFileSystem implements StorageFrameworkProvider {
  isSignedIn: boolean
  private token

  constructor(
    client_id: string,
    client_secret: string,
    repo: string,
    owner: string
  ) {
    this.token = sessionStorage.getItem(guid)
    console.log('constructor() - the token: ', this.token)
    this.isSignedIn = !!this.token
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

try {
  window.tempMikko = new GithubFileSystem()
  window.tempMikko.open()
} catch (e) {
  console.error(e)
}
