import { Octokit } from '@octokit/core'
import { SFError } from '../lib/SFError'
import { toBase64 } from '../lib/toBase64'
import { Result, type OkOrError } from '../lib/utilities'
import type { SingleFile } from './GithubTypes'

export class GitHubAPI {
  private readonly octokit: Octokit
  private readonly repo: string
  private readonly owner: string

  constructor(config: { authToken: string; repo: string; owner: string }) {
    this.octokit = new Octokit({
      auth: config.authToken, // https://github.com/settings/tokens
      userAgent: 'doclea',
      baseUrl: 'https://api.github.com',
      log: {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error
      }
    })

    this.repo = config.repo
    this.owner = config.owner
  }

  public createGithubFile(
    newFileFullPath: string,
    content: Buffer | string,
    sha?: string
  ): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      await this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: this.owner,
          repo: this.repo,
          path: newFileFullPath,
          message: 'doclea created file',
          content: toBase64(content),
          sha
        })
        .then((response) => {
          if (sha && response.status === 200) resolve()
          else if (!sha && response.status === 201) resolve()
          else reject(new SFError('Failed to create file in GitHub', response))
        })
    })
  }

  public getGithubFile(fullPath: string): Result<SingleFile, void> {
    return new Result((resolve, reject) => {
      this.octokit
        .request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: this.owner,
          repo: this.repo,
          path: fullPath,
          headers: {
            'If-None-Match': ''
          }
        })
        .then((response) => {
          if (response.status === 200) resolve(response.data as SingleFile)
          else reject(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  public deleteFile(fullPath: string, sha: string) {
    return new Result(async (resolve, reject) => {
      await this.octokit
        .request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner: this.owner,
          repo: this.repo,
          path: fullPath,
          message: 'doclea removed file',
          sha
        })
        .then((response) => {
          if (response.status === 200) {
            resolve()
          } else {
            reject(response)
          }
        })
        .catch((e) => {
          console.error(e)
          reject(e)
        })
    })
  }

  public getDir(fullPath) {
    return this.getGithubFile(fullPath)
  }
}
