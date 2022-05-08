import { Octokit } from '@octokit/core'
import type { Readable } from 'src/lib/utilities/stores'
import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type {
  StorageFrameworkFileEntry,
  StorageFrameworkDirectoryEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { GithubFileSystem } from './GithubFileSystem'
import type { ArrayResponse, SingleFile } from './GithubTypes'

export class GithubFileEntry implements StorageFrameworkFileEntry {
  readonly isDirectory = false
  readonly isFile = true
  readonly fullPath: string
  readonly name: string
  readonly content_url: string
  private parent: StorageFrameworkDirectoryEntry
  octokit: Octokit
  githubEntry: SingleFile

  constructor(
    parent: StorageFrameworkDirectoryEntry,
    fullPath: string,
    name: string,
    octokit: Octokit
  ) {
    this.parent = parent
    this.fullPath = fullPath
    this.name = name
    this.octokit = octokit

    console.log(this)
  }

  watchContent(): Result<Readable<SFFile>, SFError> {
    throw new Error('Method not implemented.')
  }

  read(): Result<SFFile, SFError> {
    return new Result(async (result) => {
      await this.getGithubFile(this.fullPath)
      result(
        new SFFile(this.name, 0, [
          decodeURIComponent(escape(window.atob(this.githubEntry.content)))
        ])
      )
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
          sha: this.githubEntry.sha
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
        reject(new SFError(`Failed to get parent of ${this.fullPath}`))
      }
    })
  }

  remove(): OkOrError<SFError> {
    return new Result(async (resolve) => {
      await this.getGithubFile(this.fullPath)
      await this.removeGithubFile(this.fullPath, this.githubEntry.sha)
      resolve
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result(async () => {
      await this.getGithubFile(this.fullPath)

      let fileName = this.fullPath.split('/').pop()
      let newFullPathOfFile = directory.isRoot
        ? fileName
        : directory.fullPath + '/' + fileName
      await this.createGithubFile(newFullPathOfFile, this.githubEntry.content)

      await this.removeGithubFile(this.fullPath, this.githubEntry.sha)
    })
  }

  rename(name: string): OkOrError<SFError> {
    return new Result(async () => {
      await this.getGithubFile(this.fullPath)

      let newFileFullPath = this.parent.isRoot
        ? name
        : this.parent.fullPath + '/' + name
      await this.createGithubFile(newFileFullPath, this.githubEntry.content)

      await this.removeGithubFile(this.fullPath, this.githubEntry.sha)
    })
  }

  private getGithubFile(getFileFullPath: string): Result<SingleFile, void> {
    return new Result((resolve, reject) => {
      this.octokit
        .request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: getFileFullPath
        })
        .then(({ data }) => {
          console.log('Succesfully read file from GitHub: ', getFileFullPath)
          this.githubEntry = <SingleFile>data
          resolve(this.githubEntry)
        })
        .catch((error) => {
          console.log('Failed to read file from GitHub: ', getFileFullPath)
          reject
        })
    })
  }

  private createGithubFile(newFileFullPath: string, contentInBase65: string): Result<void, void> {
    return new Result((resolve, reject) => {
      this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: newFileFullPath,
          message: 'doclea created file',
          content: contentInBase65
        })
        .then((response) => {
          if (response.status == 201) {
            console.log('Succesfully created file in GitHub: ', newFileFullPath)
            resolve
          } else {
            console.log('Failed to create file in GitHub: ', newFileFullPath)
            reject
          }
        })
    })
  }

  private removeGithubFile(removeFileFullPath: string, sha: string): Result<void, void> {
    return new Result((resolve, reject) => {
      this.octokit
        .request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: removeFileFullPath,
          message: 'doclea removed file',
          sha: sha
        })
        .then((response) => {
          console.log(response)
          if (response.status == 200) {
            console.log(
              'Succesfully removed file in GitHub: ',
              removeFileFullPath
            )
          } else {
            console.log('Failed to remove file in GitHub: ', removeFileFullPath)
          }
        })
    })
  }
}
