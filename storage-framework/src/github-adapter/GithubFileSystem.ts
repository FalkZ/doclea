import { Octokit } from '@octokit/core'
import { SFError } from '../lib/SFError'
import {
  StorageFrameworkProvider,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import { Result } from '../lib/utilities'
import { GithubDirectoryEntry } from './GithubDirectoryEntry'

export class GithubFileSystem implements StorageFrameworkProvider {
  static readonly config = {
    owner: 'rattle99',
    repo: 'QtNotepad'
  }

  octokit: Octokit

  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      this.octokit = new Octokit({
        auth: 'TODO-token', // https://github.com/settings/tokens
        userAgent: 'doclea',

        baseUrl: 'https://api.github.com',

        log: {
          debug: console.debug,
          info: console.info,
          warn: console.warn,
          error: console.error
        }
      })

      this.readDirFromGithub()
        .then((githubEntry) => {
          resolve(githubEntry)
        })
        .catch(() => {
          reject(new SFError('Failed to get github workspace', new Error()))
        })
    })
  }

  private async readDirFromGithub() {
    const { data } = await this.octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner: GithubFileSystem.config.owner,
        repo: GithubFileSystem.config.repo,
        path: ''
      }
    )
    return new GithubDirectoryEntry(null, data, true, this.octokit)
  }
}

