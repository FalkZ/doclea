import { Octokit } from '@octokit/core'
import { SFError } from '../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { GithubFileEntry } from './GithubFileEntry'
import { GithubFileSystem } from './GithubFileSystem'

export class GithubDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory = true
  readonly isFile = false
  readonly fullPath: string
  readonly name: string
  isRoot: boolean
  children: StorageFrameworkEntry[] = []
  parent: StorageFrameworkDirectoryEntry
  octokit: Octokit

  constructor(
    parent: StorageFrameworkDirectoryEntry,
    githubEntry,
    isRoot: boolean,
    octokit: Octokit
  ) {
    this.parent = parent
    this.name = githubEntry.name
    this.fullPath = githubEntry.path

    this.isRoot = isRoot

    if (this.isRoot == true) return

    githubEntry.forEach((element) => {
      if (element.type == 'dir') {
        this.addDirectory(element)
      } else if (element.type == 'file') {
        this.addFile(element)
      }
    })
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result(() => {
      if (this.parent != null) {
        const obj = {
          name: this.name,
          path: this.fullPath
        }
        this.readDirFromGithub(obj)
      }
      this.children
    })
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    throw new Error('Method not implemented.')
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
    throw new Error('Method not implemented.')
  }

  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  remove(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  private addFile(githubObj) {
    const githubFile = new GithubFileEntry(this, githubObj, this.octokit)
    this.children.push(githubFile)
  }

  private addDirectory(githubObj) {
    const githubDirectory = new GithubDirectoryEntry(
      this,
      githubObj,
      false,
      this.octokit
    )

    this.children.push(githubDirectory)
  }

  private async readDirFromGithub(githubObj) {
    let pathToGet = githubObj.name
    if (this.fullPath != null) {
      pathToGet = this.fullPath + '/' + githubObj.name
    }

    const { data } = await this.octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner: GithubFileSystem.config.owner,
        repo: GithubFileSystem.config.repo,
        path: pathToGet
      }
    )

    const githubDirectory = new GithubDirectoryEntry(
      this,
      data,
      false,
      this.octokit
    )
    this.children.push(githubDirectory)
    return githubDirectory
  }
}
