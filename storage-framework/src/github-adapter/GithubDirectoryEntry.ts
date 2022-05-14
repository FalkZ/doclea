import { Octokit } from '@octokit/core'
import type { Readable } from '../lib/utilities/stores'
import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { Result, OkOrError } from '../lib/utilities'
import { GithubFileEntry } from './GithubFileEntry'
import { GithubFileSystem } from './GithubFileSystem'
import type { ArrayResponse, Directory, GithubResponse } from './GithubTypes'

/**
 * Contains all methods for GithubDirectoryEntry
 */
export class GithubDirectoryEntry implements StorageFrameworkDirectoryEntry {
  public readonly isDirectory = true
  public readonly isFile = false
  public readonly fullPath: string
  public readonly name: string
  private githubEntry: ArrayResponse
  public readonly isRoot: boolean
  private children: StorageFrameworkEntry[] = []
  public readonly parent: StorageFrameworkDirectoryEntry
  private octokit: Octokit

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

  /**
   * Gets children of directory entry
   * @returns {StorageFrameworkEntry[]} on success
   * @returns {SFError} on error
   */
  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result(async (resolve, reject) => {
      await this.getGithubDir()
        .then(() => {
          this.createChildren()
          resolve(this.children)
        })
        .catch(() => {
          console.log('Failed to get children: ', this.fullPath)
          reject(new SFError('Failed to get children'))
        })
    })
  }

  /**
   * Creates file in entry
   * @param {string} name
   * @returns {StorageFrameworkFileEntry} on success
   * @returns {SFError} on error
   */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result(async (resolve, reject) => {
      const pathOfDir = this.isRoot ? name : this.fullPath + '/' + name
      await this.createGithubFile(pathOfDir + '/' + name, 'Cg==')
      resolve(new GithubFileEntry(this, pathOfDir, name, this.octokit))
    })
  }

  /**
   * Creates directory in entry
   * @param {string} name
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result(async (resolve, reject) => {
      const pathOfDir = this.isRoot ? name : this.parent.fullPath + '/' + name
      await this.createGithubFile(pathOfDir + '/' + 'README.md', 'Cg==')
      resolve(new GithubDirectoryEntry(this, pathOfDir, name, this.octokit))
    })
  }

  /**
   * Gets parent of directory entry
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result(() => this.parent)
  }

  /**
   * Moves directory
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
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

  /**
   * Renames directory
   * @param {string} name
   * @returns {SFError} on error
   */
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
          )

          // 3. remove old file from old directory
          await storageElements[index].remove()
        }
        console.log('trying to remove: ', storageElements[index].fullPath)
      }
    })
  }

  /**
   * Removes directory
   * @returns {SFError} on error
   */
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
          owner: GithubFileSystem.owner,
          repo: GithubFileSystem.repo,
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

  private createGithubFile(
    newFileFullPath: string,
    contentInBase65: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.owner,
          repo: GithubFileSystem.repo,
          path: newFileFullPath,
          message: 'doclea created file',
          content: contentInBase65
        })
        .then((response) => {
          if (response.status == 201) {
            console.log('Succesfully created file in GitHub: ', newFileFullPath)
            resolve()
          } else {
            console.log('Failed to create file in GitHub: ', newFileFullPath)
            reject()
          }
        })
    })
  }

  private createChildren(): void {
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
