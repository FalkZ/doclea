import { Octokit } from '@octokit/core'
import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import {
  StorageFrameworkFileEntry,
  StorageFrameworkDirectoryEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { GithubFileSystem } from './GithubFileSystem'

export class GithubFileEntry implements StorageFrameworkFileEntry {
  readonly isDirectory = false
  readonly isFile = true
  readonly fullPath: string
  readonly name: string
  readonly content_url: string
  private parent: StorageFrameworkDirectoryEntry
  octokit: Octokit
  githubObj

  constructor(parent, githubObj, octokit) {
    this.parent = parent
    this.name = githubObj.name
    this.fullPath = githubObj.path
    this.content_url = githubObj.download_url
    this.octokit = octokit
    this.githubObj = githubObj
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      fetch(this.content_url)
        .then((response) => {
          if (!response.ok)
            reject(new SFError(`Failed to fetch ${this.content_url}`, null))
          return response.text()
        })
        .then((text) => resolve(new SFFile(this.name, 0, [text])))
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.saveFileInGithub(file).catch((error) =>
        reject(new SFError('Failed to save file', error))
      )
    })
  }

  private async saveFileInGithub(file: File) {
    const { data } = await this.octokit.request(
      'PUT /repos/{owner}/{repo}/contents/{path}',
      {
        owner: GithubFileSystem.config.owner,
        repo: GithubFileSystem.config.repo,
        path: this.fullPath,
        message: 'update content',
        content: file.text.toString()
      }
    )
    return
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      } else {
        reject(
          new SFError(`Failed to get parent of ${this.fullPath}`, new Error())
        )
      }
    })
  }

  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.deleteFileInGithub().catch((error) =>
        reject(new SFError('Failed to save file', error))
      )
    })
  }

  private async deleteFileInGithub() {
    const { data } = await this.octokit.request(
      'DELETE /repos/{owner}/{repo}/contents/{path}',
      {
        owner: GithubFileSystem.config.owner,
        repo: GithubFileSystem.config.repo,
        path: this.fullPath,
        message: 'delete file',
        sha: this.githubObj.sha
      }
    )
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }
}
