import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'

import {
  getSolidDataset,
  getThingAll,
  isContainer,
  deleteContainer,
  createContainerAt,
  saveFileInContainer,
  type WithResourceInfo,
  saveSolidDatasetAt,
  type SolidDataset,
  type WithServerResourceInfo
} from '@inrupt/solid-client'

import { SolidFileEntry } from './SolidFileEntry'
import { Result, type OkOrError } from '../lib/utilities/result'
import { getFileName } from '../lib/utilities/apiUtils'

/**
 * Contains all methods for SolidDirectoryEntry
 */
export class SolidDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory: true
  readonly isFile: false
  fullPath: string
  name: string
  isRoot: boolean
  private parent: SolidDirectoryEntry | null

  constructor(fullPath: string, parent: SolidDirectoryEntry | null) {
    this.fullPath = fullPath
    this.name = getFileName(fullPath)
    this.parent = parent
    this.isRoot = parent === null
  }

  /**
   * Gets children of directory entry
   * @returns {StorageFrameworkEntry[]} on success
   * @returns {SFError} on error
   */
  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      this.fetch()
        .then((subjects) =>
          resolve(
            subjects.map((subject) => {
              if (isContainer(subject.url)) {
                return new SolidDirectoryEntry(subject.url, this)
              } else {
                return new SolidFileEntry(
                  subject.url,
                  getFileName(subject.url),
                  this
                )
              }
            })
          )
        )
        .catch((e) => reject(new SFError('Failed to ...', e)))
    })
  }

  /**
   * Creates file in entry
   * @param {string} name
   * @returns {StorageFrameworkFileEntry} on success
   * @returns {SFError} on error
   */
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      this.createEmptyFile(name)
        .then((newFile) =>
          resolve(
            new SolidFileEntry(
              newFile.internal_resourceInfo.sourceIri,
              getFileName(newFile.internal_resourceInfo.sourceIri),
              this
            )
          )
        )
        .catch((err) =>
          reject(new SFError(`Failed to delete ${this.fullPath}`, err))
        )
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
    return new Result((resolve, reject) => {
      this.createContainer(name)
        .then((container) =>
          resolve(
            new SolidDirectoryEntry(
              container.internal_resourceInfo.sourceIri,
              this.parent
            )
          )
        )
        .catch((err) =>
          reject(
            new SFError(
              `Failed to create directory ${name} in ${this.fullPath}`,
              err
            )
          )
        )
    })
  }

  /**
   * Gets parent of directory entry
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
   * Moves directory
   * @param {StorageFrameworkDirectoryEntry} directory
   * @returns {SFError} on error
   */
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.moveToDirectory(directory)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to move directory`, err)))
    })
  }

  /**
   * Renames directory
   * @param {string} name
   * @returns {SFError} on error
   */
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.rename(name)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to rename directory`, err)))
    })
  }

  /**
   * Removes directory
   * @returns {SFError} on error
   */
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.deleteSolidDataset()
        .then(() => resolve())
        .catch((err) =>
          reject(new SFError(`Failed to delete ${this.fullPath}`, err))
        )
    })
  }

  private async fetch() {
    const dataset = await getSolidDataset(this.fullPath, {
      fetch: fetch
    })

    const all = Object.keys(dataset.graphs.default)
      .map((graph) =>
        getSolidDataset(graph, {
          fetch: fetch
        })
      )
      .map((values) => values.then((v) => getThingAll(v)))

    const data = await Promise.all(all)
    const dataFlatten = data.flat()

    return dataFlatten
  }

  private async deleteSolidDataset(): Promise<void> {
    await deleteContainer(this.fullPath, { fetch: fetch })
  }

  private async createContainer(
    name: string
  ): Promise<SolidDataset & WithServerResourceInfo> {
    if (this.parent == null) {
      return await createContainerAt(this.fullPath + name, { fetch: fetch })
    } else {
      return await createContainerAt(this.parent.fullPath + name, {
        fetch: fetch
      })
    }
  }

  private async createEmptyFile(
    name: string
  ): Promise<Blob & WithResourceInfo> {
    const newFile = await saveFileInContainer(
      this.fullPath,
      new Blob([''], { type: 'plain/text' }),
      { slug: name, fetch: fetch }
    )
    return newFile
  }

  private async renameDirectory(name: string): Promise<void> {
    const existingDataset = await getSolidDataset(this.fullPath, {
      fetch: fetch
    })
    const directoryName = getFileName(
      existingDataset.internal_resourceInfo.sourceIri
    )
    const newDirectoryPath =
      existingDataset.internal_resourceInfo.sourceIri.replace(
        directoryName,
        name
      )

    await saveSolidDatasetAt(newDirectoryPath, existingDataset, {
      fetch: fetch
    })
    await deleteContainer(this.fullPath, { fetch: fetch })
    this.fullPath = newDirectoryPath
  }

  private async moveToDirectory(
    directory: StorageFrameworkDirectoryEntry
  ): Promise<void> {
    if (directory instanceof SolidDirectoryEntry) {
      const existingDataset = await getSolidDataset(this.fullPath, {
        fetch: fetch
      })
      const directoryName = getFileName(
        existingDataset.internal_resourceInfo.sourceIri
      )
      const moveToDirectory = directory.fullPath + directoryName
      await saveSolidDatasetAt(moveToDirectory, existingDataset, {
        fetch: fetch
      })
      directory.fullPath = moveToDirectory
      const children = await this.getChildren()
      children.forEach((child) => child.moveTo(directory))
    }
    await this.deleteSolidDataset()
  }
}
