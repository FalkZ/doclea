import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, type OkOrError } from '../lib/utilities'

import {
  getSolidDataset,
  getThingAll,
  isContainer,
  deleteContainer,
  createContainerAt,
  saveFileInContainer,
  type WithResourceInfo,
  saveSolidDatasetAt
} from '@inrupt/solid-client'
import { SolidFileEntry } from './SolidFileEntry'
import type { Readable } from 'src/lib/utilities/stores'

export class SolidDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory: true
  readonly isFile: false
  fullPath: string
  name: string
  isRoot: boolean
  private parent: SolidDirectoryEntry | null

  constructor(fullPath: string, parent: SolidDirectoryEntry) {
    this.fullPath = fullPath
    this.name = this.getFileName(fullPath)
    this.parent = parent
    this.isRoot = parent == null
  }

  //TODO
  watchChildren(): Result<Readable<StorageFrameworkEntry[]>, SFError> {
    throw new Error('Method not implemented.')
  }

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
                  this.getFileName(subject.url),
                  this
                )
              }
            })
          )
        )
        .catch((e) => reject(new SFError('Failed to ...', e)))
    })
  }
  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return new Result((resolve, reject) => {
      this.createEmptyFile(name)
        .then((newFile) =>
          resolve(
            new SolidFileEntry(
              newFile.internal_resourceInfo.sourceIri,
              this.getFileName(newFile.internal_resourceInfo.sourceIri),
              this
            )
          )
        )
        .catch((err) =>
          reject(new SFError(`Failed to delete ${this.fullPath}`, err))
        )
    })
  }
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
  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve, reject) => {
      if (this.parent) {
        resolve(this.parent)
      } else {
        reject(
          new SFError(`Failed to get parent of ${this.fullPath}`, new Error())
        )
      }
    })
  }
  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.moveToDirectory(directory)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to move directory`, err)))
    })
  }
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.rename(name)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to rename directory`, err)))
    })
  }
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.deleteSolidDataset()
        .then(() => resolve())
        .catch((err) =>
          reject(new SFError(`Failed to delete ${this.fullPath}`, err))
        )
    })
  }

  async fetch() {
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

  async deleteSolidDataset() {
    await deleteContainer(this.fullPath, { fetch: fetch })
  }

  async createContainer(name: string) {
    return await createContainerAt(this.parent.fullPath + name, {
      fetch: fetch
    })
  }

  async createEmptyFile(name: string): Promise<Blob & WithResourceInfo> {
    const newFile = await saveFileInContainer(
      this.fullPath,
      new Blob([''], { type: 'plain/text' }),
      { slug: name, fetch: fetch }
    )
    return newFile
  }

  async renameDirectory(name: string) {
    const existingDataset = await getSolidDataset(this.fullPath, {
      fetch: fetch
    })
    const directoryName = this.getFileName(
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

  async moveToDirectory(directory: StorageFrameworkDirectoryEntry) {
    if (directory instanceof SolidDirectoryEntry) {
      const existingDataset = await getSolidDataset(this.fullPath, {
        fetch: fetch
      })
      const directoryName = this.getFileName(
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
    this.deleteSolidDataset()
  }

  getFileName(url: string): string {
    return url.match('([^/]+)(?=[^/]*/?$)')[0]
  }
}
