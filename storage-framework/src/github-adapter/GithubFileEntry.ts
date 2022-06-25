import type { Octokit } from '@octokit/core'
import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import { Result, type OkOrError } from '../lib/utilities'
import { GithubFileSystem } from './GithubFileSystem'
import type { SingleFile } from './GithubTypes'
import { Mutex } from '../lib/utilities/mutex'
import { getFileContent } from '../lib/utilities/getFileContent'
import type {
  WritableDirectoryEntry,
  WritableFileEntry
} from '../lib/new-interface/SFBaseEntry'
import { toBase64 } from '../lib/toBase64'
import type { GitHubAPI } from './GithubApi'

const noop = () => {}

/**
 * Contains all methods for GithubFileEntry
 */
export class GithubFileEntry implements WritableFileEntry {
  public readonly isDirectory = false
  public readonly isFile = true
  public readonly isReadonly: false = false

  public readonly fullPath: string
  public readonly name: string
  private readonly parent: WritableDirectoryEntry
  private readonly githubAPI: GitHubAPI
  private get githubEntry(): Promise<SingleFile> {
    return this.getGithubFile(this.fullPath)
  }

  private readonly mutex = new Mutex()

  public constructor(
    parent: WritableDirectoryEntry,
    fullPath: string,
    name: string,
    octokit: GitHubAPI
  ) {
    this.parent = parent
    this.fullPath = fullPath
    this.name = name
    this.githubAPI = octokit
  }

  /**
   * Reads file
   * @returns {SFFile} on success
   * @returns {SFError} on error
   */
  public read(): Result<SFFile, SFError> {
    return new Result(async (result) => {
      const f = await this.githubEntry
      result(new SFFile(this.name, 0, [atob(f.content)]))
    })
  }

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
  public async write(file: File): OkOrError<SFError> {
    return this.githubAPI.createGithubFile(
      this.fullPath,
      await file.text(),
      (await this.githubEntry).sha
    )
  }

  /**
   * Gets parent of file
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  public getParent(): Result<WritableDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      } else {
        reject(new SFError(`Failed to get parent of ${this.fullPath}`))
      }
    })
  }

  /**
   * Removes file
   * @returns {SFError} on error
   */
  public delete(): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      await this.mutex.apply(async () => {
        try {
          await this.githubAPI.deleteFile(
            this.fullPath,
            (
              await this.githubEntry
            ).sha
          )

          resolve()
        } catch (error) {
          reject(new SFError('Failed to remove file', error))
        }
      })
    })
  }

  /**
   * Moves file
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  public moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      await this.mutex.apply(async () => {
        try {
          await this.getGithubFile(this.fullPath)

          const fileName = this.fullPath.split('/').pop()
          const newFullPathOfFile = directory.isRoot
            ? fileName
            : `${directory.fullPath}/${fileName}`
          await this.githubAPI.createGithubFile(
            newFullPathOfFile,
            (
              await this.githubEntry
            ).content
          )

          await this.githubAPI.deleteFile(
            this.fullPath,
            (
              await this.githubEntry
            ).sha
          )

          resolve()
        } catch (error) {
          reject(new SFError('Failed to move file', error))
        }
      })
    })
  }

  /**
   * Renames file
   * @param {string} name
   * @returns {SFError} on error
   */
  public rename(name: string): OkOrError<SFError> {
    return new Result(async (resolve, reject) => {
      await this.mutex.apply(async () => {
        try {
          await this.getGithubFile(this.fullPath)

          const newFileFullPath = this.parent.isRoot
            ? name
            : this.parent.fullPath + '/' + name
          await this.githubAPI.createGithubFile(
            newFileFullPath,
            (
              await this.githubEntry
            ).content
          )

          await this.githubAPI.deleteFile(
            this.fullPath,
            (
              await this.githubEntry
            ).sha
          )

          resolve()
        } catch (error) {
          reject(new SFError('Failed to rename file', error))
        }
      })
    })
  }

  private getGithubFile(getFileFullPath: string): Result<SingleFile, void> {
    return this.githubAPI.getGithubFile(getFileFullPath)
  }
}
