import { SFError } from '../lib/SFError'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'

import {
  getSolidDataset,
  getThingAll,
  isContainer,
  deleteSolidDataset,
  createContainerAt
} from '@inrupt/solid-client'
import { SolidFileEntry } from './SolidFileEntry'

export class SolidDirectoryEntry implements StorageFrameworkDirectoryEntry {
  readonly isDirectory: true
  readonly isFile: false
  fullPath: string
  name: string
  private parent: SolidDirectoryEntry

  constructor(fullPath: string, name: string, parent: SolidDirectoryEntry) {
    this.fullPath = fullPath
    this.name = this.getName(fullPath)
    this.parent = parent
  }

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return new Result((resolve, reject) => {
      this.fetch()
        .then((subjects) =>
          resolve(
            subjects.map((subject) => {
              if (isContainer(subject.url)) {
                return new SolidDirectoryEntry(
                  subject.url,
                  this.getName(subject.url),
                  this
                )
              } else {
                return new SolidFileEntry(
                  subject.url,
                  this.getName(subject.url),
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
    throw new Error('Method not implemented.')
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
              this.getName(container.internal_resourceInfo.sourceIri),
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
    throw new Error('Method not implemented.')
  }
  rename(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
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
    await deleteSolidDataset(this.fullPath, { fetch: fetch })
  }

  async createContainer(name: string) {
    return await createContainerAt(this.parent.fullPath + name, {
      fetch: fetch
    })
  }

  getName(url: string): string {
    return url.match('([^/]+)(?=[^/]*/?$)')[0]
  }
}
