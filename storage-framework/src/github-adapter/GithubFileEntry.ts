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
  private readonly octokit: Octokit
  private githubEntry: SingleFile

  private readonly mutex = new Mutex()

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

    noop(this)
  }

  /**
   * Reads file
   * @returns {SFFile} on success
   * @returns {SFError} on error
   */
  public read(): Result<SFFile, SFError> {
    return new Result(async (result) => {
      await this.getGithubFile(this.fullPath)
      result(new SFFile(this.name, 0, [atob(this.githubEntry.content)]))
    })
  }

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
  public write(file: File): OkOrError<SFError> {
    noop(file)
    return new Result(async (resolve, reject) => {
      this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.owner,
          repo: GithubFileSystem.repo,
          path: this.fullPath,
          message: 'doclea update',
          content: btoa(await getFileContent(file)),
          sha: this.githubEntry.sha
        })
        .then((response) => {
          if (response.status === 200) {
            resolve()
          } else {
            reject(new SFError('Failed to save file'))
          }
        })
        .catch((err) => reject(new SFError(`Failed to save file`, err)))
    })
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
          await this.getGithubFile(this.fullPath)
          await this.removeGithubFile(this.fullPath, this.githubEntry.sha)

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
          await this.createGithubFile(
            newFullPathOfFile,
            this.githubEntry.content
          )

          await this.removeGithubFile(this.fullPath, this.githubEntry.sha)

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
          await this.createGithubFile(newFileFullPath, this.githubEntry.content)

          await this.removeGithubFile(this.fullPath, this.githubEntry.sha)

          resolve()
        } catch (error) {
          reject(new SFError('Failed to rename file', error))
        }
      })
    })
  }

  private getGithubFile(getFileFullPath: string): Result<SingleFile, void> {
    return new Result((resolve, reject) => {
      this.octokit
        .request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.owner,
          repo: GithubFileSystem.repo,
          path: getFileFullPath
        })
        .then(({ data }) => {
          noop('Succesfully read file from GitHub: ', getFileFullPath)
          this.githubEntry = data as SingleFile
          resolve(this.githubEntry)
        })
        .catch((error) => {
          noop('Failed to read file from GitHub: ', getFileFullPath)
          reject(error)
        })
    })
  }

  private createGithubFile(
    newFileFullPath: string,
    contentInBase65: string
  ): Result<void, void> {
    return new Result(async (resolve, reject) => {
      await this.octokit
        .request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.owner,
          repo: GithubFileSystem.repo,
          path: newFileFullPath,
          message: 'doclea created file',
          content: contentInBase65
        })
        .then((response) => {
          if (response.status === 201) {
            noop('Succesfully created file in GitHub: ', newFileFullPath)
            resolve()
          } else {
            noop('Failed to create file in GitHub: ', newFileFullPath)
            reject()
          }
        })
    })
  }

  private removeGithubFile(
    removeFileFullPath: string,
    sha: string
  ): Result<void, void> {
    return new Result(async (resolve, reject) => {
      await this.octokit
        .request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner: GithubFileSystem.owner,
          repo: GithubFileSystem.repo,
          path: removeFileFullPath,
          message: 'doclea removed file',
          sha: sha
        })
        .then((response) => {
          noop(response)
          if (response.status === 200) {
            noop('Succesfully removed file in GitHub: ', removeFileFullPath)
            resolve()
          } else {
            noop('Failed to remove file in GitHub: ', removeFileFullPath)
            reject()
          }
        })
    })
  }
}
