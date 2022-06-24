import type { Octokit } from '@octokit/core'
import type {
  DirectoryEntry,
  Entry,
  FileEntry,
  WritableDirectoryEntry
} from '../lib/new-interface/SFBaseEntry'
import { SFError } from '../lib/SFError'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../lib/utilities'
import { GithubFileEntry } from './GithubFileEntry'
import { GithubFileSystem } from './GithubFileSystem'
import type { ArrayResponse } from './GithubTypes'

const noop = () => {}

/**
 * Contains all methods for GithubDirectoryEntry
 */
export class GithubDirectoryEntry implements WritableDirectoryEntry {
  public readonly isDirectory = true
  public readonly isFile = false
  public isReadonly: false = false
  public readonly fullPath: string
  public readonly name: string
  private githubEntry: ArrayResponse
  public readonly isRoot: boolean
  private children: Entry[] = []
  public readonly parent: WritableDirectoryEntry
  private readonly octokit: Octokit

  public constructor(
    parent: WritableDirectoryEntry,
    fullPath: string,
    name: string,
    octokit: Octokit
  ) {
    this.parent = parent
    this.fullPath = fullPath
    this.name = name
    this.octokit = octokit
    this.isRoot = fullPath === ''
  }

  /**
   * Gets children of directory entry
   * @returns {StorageFrameworkEntry[]} on success
   * @returns {SFError} on error
   */
  public getChildren(): Result<Entry[], SFError> {
    return new Result(async (resolve, reject) => {
      await this.getGithubDir()
        .then(() => {
          this.createChildren()
          resolve(this.children)
        })
        .catch(() => {
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
  public createFile(file: File): Result<FileEntry, SFError> {
    return new Result(async (resolve) => {
      const pathOfDir = this.isRoot
        ? file.name
        : this.fullPath + '/' + file.name
      await this.createGithubFile(pathOfDir, 'Cg==')
      resolve(new GithubFileEntry(this, pathOfDir, file.name, this.octokit))
    })
  }

  /**
   * Creates directory in entry
   * @param {string} name
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  public createDirectory(name: string): Result<DirectoryEntry, SFError> {
    return new Result(async (resolve) => {
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
  public getParent(): Result<DirectoryEntry, SFError> {
    return new Result(() => this.parent)
  }

  /**
   * Moves directory
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  public moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
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
  public rename(name: string): OkOrError<SFError> {
    return new Result(async () => {
      const storageElements = await this.getChildren()
      noop(storageElements.length)
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
        noop('trying to remove: ', storageElements[index].fullPath)
      }
    })
  }

  /**
   * Removes directory
   * @returns {SFError} on error
   */
  public delete(): OkOrError<SFError> {
    return new Result(async () => {
      const storageElements = await this.getChildren()
      noop(storageElements.length)
      for (let index = 0; index < storageElements.length; index++) {
        await storageElements[index].remove()
        noop('trying to remove: ', storageElements[index].fullPath)
      }
    })
  }

  private getGithubDir(): Promise<ArrayResponse> {
    return this.octokit
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: GithubFileSystem.owner,
        repo: GithubFileSystem.repo,
        path: this.fullPath
      })
      .then(({ data }) => {
        this.githubEntry = <ArrayResponse>data
        return data
      }) as Promise<ArrayResponse>
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
            noop('Succesfully created file in GitHub: ', newFileFullPath)
            resolve()
          } else {
            noop('Failed to create file in GitHub: ', newFileFullPath)
            reject()
          }
        })
    })
  }

  private createChildren(): void {
    this.children = []
    this.githubEntry.forEach((element) => {
      if (element.type === 'dir') {
        const githubDirectory = new GithubDirectoryEntry(
          this,
          element.path,
          element.name,
          this.octokit
        )
        this.children.push(githubDirectory)
      } else if (element.type === 'file') {
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
