import { Octokit } from '@octokit/core'
import type { Readable } from 'src/lib/utilities/stores'
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

    // this.getGithubObject()
  }

  watchContent(): Result<Readable<SFFile>, SFError> {
    throw new Error('Method not implemented.')
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      fetch(this.content_url)
        .then((response) => {
          if (!response.ok)
            reject(new SFError(`Failed to fetch ${this.content_url}`, null))
          return response.text()
        })
        .then((text) => {
          console.log(text)
          resolve(new SFFile(this.name, 0, [text]))
        })
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: this.fullPath,
          message: 'doclea update',
          content: window.btoa(
            unescape(encodeURIComponent(file.text.toString()))
          ),
          sha: this.githubObj.sha
        })
        .then((response) => {
          if (response.status == 200) {
            // this.parent.getChildren() // update parent
            resolve()
          } else {
            console.log(response)
            reject(new SFError('Failed to save file'))
          }
        })
    })
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
    return new Result(async (resolve, reject) => {
      await this.getGithubObject()
      console.log('remove: ' + this.fullPath)
      this.octokit
        .request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: this.fullPath,
          message: 'doclea removed file',
          sha: this.githubObj.data.sha
        })
        .then((response) => {
          if (response.status == 200) {
            //this.parent.getChildren() // update parent
            resolve()
          } else {
            console.log(response)
            reject(new SFError('Failed to delete file'))
          }
        })
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      let fileName = this.fullPath.split('/').pop()
      const pathOfNewFile = directory.isRoot
        ? fileName
        : directory.fullPath + '/' + fileName

      fetch(this.content_url)
        .then((response) => {
          if (!response.ok)
            reject(new SFError(`Failed to fetch ${this.content_url}`, null))
          return response.text()
        })
        .then((text) => {
          this.octokit
            .request('PUT /repos/{owner}/{repo}/contents/{path}', {
              owner: GithubFileSystem.config.owner,
              repo: GithubFileSystem.config.repo,
              path: pathOfNewFile,
              message: 'doclea moved file',
              content: window.btoa(unescape(encodeURIComponent(text)))
            })
            .then((response) => {
              if (response.status == 201) {
                const githubFile = new GithubFileEntry(
                  this,
                  response,
                  this.octokit
                )
              } else {
                reject(new SFError('Failed to create file'))
              }
            })
            .then(() => {
              this.remove()
              resolve()
            })
        })
    })
  }

  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      fetch(this.content_url)
        .then((response) => {
          if (!response.ok)
            reject(new SFError(`Failed to fetch ${this.content_url}`, null))
          return response.text()
        })
        .then((text) => {
          const pathOfNewFile = this.parent.isRoot
            ? name
            : this.parent.fullPath + '/' + name

          this.octokit
            .request('PUT /repos/{owner}/{repo}/contents/{path}', {
              owner: GithubFileSystem.config.owner,
              repo: GithubFileSystem.config.repo,
              path: pathOfNewFile,
              message: 'doclea renamed file',
              content: window.btoa(unescape(encodeURIComponent(text)))
            })
            .then((response) => {
              if (response.status == 201) {
                const githubFile = new GithubFileEntry(
                  this,
                  response,
                  this.octokit
                )
              } else {
                reject(new SFError('Failed to create file'))
              }
            })
            .then(() => {
              this.remove()
              resolve()
            })
        })
    })
  }

  private getGithubObject(): Promise<void> {
    console.log('getGithubObject: ' + this.fullPath)
    return this.octokit
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: GithubFileSystem.config.owner,
        repo: GithubFileSystem.config.repo,
        path: this.fullPath
      })
      .then((data) => {
        console.log(data)
        this.githubObj = data
      })
      .catch((error) => {
        console.log('getGithubObject failed: ' + this.fullPath)
        console.log(error)
      })
  }
}
