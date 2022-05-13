import { Octokit } from '@octokit/core'
import type { Readable } from 'src/lib/utilities/stores'
import { SFError } from '../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { GithubFileEntry } from './GithubFileEntry'
import { GithubFileSystem } from './GithubFileSystem'
import type { ArrayResponse, Directory, GithubResponse } from './GithubTypes'

export class GithubDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory = true
  readonly isFile = false
  fullPath: string
  readonly name: string
  githubEntry: ArrayResponse
  readonly isRoot: boolean
  children: StorageFrameworkEntry[] = []
  parent: StorageFrameworkDirectoryEntry
  octokit: Octokit

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
    this.isRoot = fullPath === ''

    console.log(this)
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result(async (resolve, reject) => {
      await this.getGithubDir()
        .then(() => {
          this.createChildren()
          resolve(this.children)
        })
        .catch(() => {
          console.log('Failed to get children')
        })
    })
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result(async (resolve, reject) => {
      await this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: this.fullPath + '/' + name,
          message: 'my commit message',
          content: 'bXkgbmV3IGZpbGUgY29udGVudHM='
        })
        .then((response) => {
          console.log(response)
          if (response.status == 201) {
            const file = new GithubFileEntry(
              this,
              this.fullPath,
              name,
              this.octokit
            )
            resolve(file)
          } else {
            reject(new SFError('Failed to create file'))
          }
        })
    })
  }

  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result(async (resolve, reject) => {
      const pathOfDir = this.isRoot ? name : this.parent.fullPath + '/' + name
      await this.createGithubFile(pathOfDir + '/' + 'README.md', 'Cg==')
      resolve(new GithubDirectoryEntry(this, pathOfDir, name, this.octokit))
    })
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result(() => this.parent)
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.getChildren()
        .then((elements) =>
          elements.map((element) => element.moveTo(directory))
        )
        // TODO: check all child promises
        // .then((promises) => Promise.all(promises))
        .then(() => resolve())
        .catch((error) => {
          reject(new SFError('Failed to delete directory', error))
        })
    })
  }

  rename(name: string): OkOrError<SFError> {
    return new Result(async () => {
      const storageElements = await this.getChildren()
      console.log(storageElements.length)
      for (let index = 0; index < storageElements.length; index++) {
        if (storageElements[index].isFile) {
          // 1. read file for sha
          storageElements[index].read()

          // 2. create new file with renamed directory
          const newDirFullPath = this.parent.isRoot
            ? name
            : this.parent.fullPath + '/' + name
          const newFileFullPath =
            newDirFullPath + '/' + storageElements[index].name
          await this.createGithubFile(
            newFileFullPath,
            storageElements[index].githubEntry.sha
          ) // githubEntry undelined read? maybe casting needed?

          // 3. remove old file from old directory
          await storageElements[index].remove()
        }
        console.log('trying to remove: ', storageElements[index].fullPath)
      }
    })
  }

  remove(): OkOrError<SFError> {
    return new Result(async () => {
      const storageElements = await this.getChildren()
      console.log(storageElements.length)
      for (let index = 0; index < storageElements.length; index++) {
        await storageElements[index].remove()
        console.log('trying to remove: ', storageElements[index].fullPath)
      }
    })
  }

  private getGithubDir(): Promise<ArrayResponse> {
    return new Promise((result) => {
      this.octokit
        .request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.config.owner,
          repo: GithubFileSystem.config.repo,
          path: this.fullPath
        })
        .then(({ data }) => {
          console.log('Succesfully read directory from GitHub: ', this.fullPath)
          this.githubEntry = <ArrayResponse>data
          result(this.githubEntry)
        })
        .catch((error) => {
          console.log('Failed to read directory from GitHub: ', this.fullPath)
        })
    })
  }

  /**
   * TODO: correct return type
   */
  private createGithubFile(newFileFullPath: string, contentInBase65: string) {
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

  /**
   * TODO: correct return type
   */
  private createChildren() {
    this.children = []
    this.githubEntry.forEach((element) => {
      if (element.type == 'dir') {
        const githubDirectory = new GithubDirectoryEntry(
          this,
          element.path,
          element.name,
          this.octokit
        )
        this.children.push(githubDirectory)
      } else if (element.type == 'file') {
        const githubFile = new GithubFileEntry(
          this,
          element.path,
          element.name,
          this.octokit
        )
        this.children.push(githubFile)
      }
    })
  }
}
