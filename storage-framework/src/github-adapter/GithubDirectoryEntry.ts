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
  githubEntry: ArrayResponse| Directory
  readonly isRoot: boolean
  children: StorageFrameworkEntry[] = []
  parent: StorageFrameworkDirectoryEntry
  octokit: Octokit

  constructor(
    parent: StorageFrameworkDirectoryEntry,
    githubEntry: ArrayResponse | Directory,
    isRoot: boolean,
    octokit: Octokit
  ) {
    this.parent = parent
    this.name = githubEntry.name
    this.fullPath = githubEntry.path
    this.isRoot = isRoot
    this.octokit = octokit
    this.githubEntry = githubEntry

    if (this.isRoot == false) return
    this.fullPath = ''

    this.createChildren()
  }

  private createChildren() {
    this.children = []
    this.githubEntry.forEach((element) => {
      if (element.type == 'dir') {
        const githubDirectory = new GithubDirectoryEntry(
          this,
          element,
          false,
          this.octokit
        )

        console.log(githubDirectory)
        this.children.push(githubDirectory)
      } else if (element.type == 'file') {
        const githubFile = new GithubFileEntry(this, element, this.octokit)

        console.log(githubFile)
        this.children.push(githubFile)
      }
    })
  }

  watchChildren(): Result<Readable<StorageFrameworkEntry[]>, SFError> {
    throw new Error('Method not implemented.')
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      if (this.isRoot == false) {
        this.octokit
          .request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: GithubFileSystem.config.owner,
            repo: GithubFileSystem.config.repo,
            path: this.fullPath
          })
          .then((data) => {
            console.log(data)
            this.githubEntry = data
            this.createChildren()
            resolve(this.children)
          })
          .catch((error) => {
            console.log(error)
            reject(new SFError('Failed to get ', error))
          })
      } else {
        resolve(this.children)
      }
    })
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      this.octokit
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
            const githubFile = new GithubFileEntry(this, response, this.octokit)
            resolve(githubFile)
          } else {
            reject(new SFError('Failed to create file'))
          }
        })
    })
  }

  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    throw new Error('Method not implemented.')
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result(() => this.parent)
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.getChildren()
        .then((elements) => {
          elements.forEach((element) => {
            element.moveTo(directory)
          })
        })
        .then(() => resolve())
        .catch((error) => {
          reject(new SFError('Failed to delete directory'))
        })
    })
  }

  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.getChildren()
        .then((elements) => {
          elements.forEach((element) => {
            element.remove()
          })
        })
        .then(() => resolve())
        .catch((error) => {
          reject(new SFError('Failed to delete directory'))
        })
    })
  }
}
