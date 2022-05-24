import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import type { SolidDirectoryEntry } from './SolidDirectoryEntry'
import { saveFileInContainer, deleteFile, getFile } from '@inrupt/solid-client'

import { Result, type OkOrError } from '../lib/utilities/result'
import {
  getFileName,
  replaceFileNameWithNewName
} from '../lib/utilities/apiUtils'

type SolidFile = Awaited<ReturnType<typeof getFile>>

/**
 * Contains all methods for SolidFileEntry
 */
export class SolidFileEntry implements StorageFrameworkFileEntry {
  readonly fullPath: string
  readonly isDirectory: false
  readonly isFile: true
  readonly isReadonly: false = false
  readonly wasModified: boolean
  name: string
  private readonly parent: SolidDirectoryEntry
  private readonly file: FileSystemFileEntry

  constructor(fullPath: string, name: string, parent: SolidDirectoryEntry) {
    this.fullPath = fullPath
    this.name = name
    this.parent = parent
  }

  /**
   * Reads file
   * @returns {SFFile} on success
   * @returns {SFError} on error
   */
  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      this.file.file(
        (file) => {
          resolve(new SFFile(this.name, file.lastModified, [file]))
        },
        (err) => reject(new SFError('Failed to read file', err))
      )
    })
  }

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.saveFile(file)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to save file`, err)))
    })
  }

  /**
   * Gets parent of file
   * @returns {StorageFrameworkDirectoryEntry} on success
   * @returns {SFError} on error
   */
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      } else {
        reject(new SFError(`Failed to get parent of ${this.fullPath}`))
      }
    })
  }

  /**
   * Moves file
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.moveFileToContainer(directory)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to move file`, err)))
    })
  }

  /**
   * Renames file
   * @param {string} name
   * @returns {SFError} on error
   */
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.renameFile(name)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to rename file`, err)))
    })
  }

  /**
   * Removes file
   * @returns {SFError} on error
   */
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.deleteFile()
        .then(() => resolve())
        .catch((err) =>
          reject(new SFError(`Failed to remove ${this.fullPath}`, err))
        )
    })
  }

  update(file: File | string): OkOrError<SFError> {
    return null
  }

  private async renameFile(name: string): Promise<void> {
    const file: SolidFile = await getFile(this.fullPath, { fetch: fetch })

    const fileName = getFileName(file.internal_resourceInfo.sourceIri)
    const newFileName = replaceFileNameWithNewName(fileName, name)
    file.internal_resourceInfo.sourceIri =
      file.internal_resourceInfo.sourceIri.replace(fileName, '')
    const renamedFile = await saveFileInContainer(
      file.internal_resourceInfo.sourceIri,
      file,
      { slug: newFileName, fetch: fetch }
    )
    this.name = renamedFile.internal_resourceInfo.sourceIri
  }

  // There is also an overwriteFile function which overwrites the file
  // if it exists and creates the containers which are in the url but not in the pod
  /**
   * Saves file
   * @param {File} file
   */
  async saveFile(file: File): Promise<void> {
    await saveFileInContainer(this.parent.fullPath, file)
  }

  /**
   * Deletes file
   */
  async deleteFile(): Promise<void> {
    await deleteFile(this.fullPath, { fetch: fetch })
  }

  /**
   * Moves file to container
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SolidFile}
   */
  async moveFileToContainer(
    directory: StorageFrameworkDirectoryEntry
  ): Promise<SolidFile> {
    const file: SolidFile = await getFile(this.fullPath, { fetch: fetch })

    return await saveFileInContainer(directory.fullPath, file, {
      slug: getFileName(file.internal_resourceInfo.sourceIri),
      fetch: fetch
    })
  }
}
