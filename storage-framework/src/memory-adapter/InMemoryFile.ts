import { SFFile } from '../lib/SFFile'
import { OkOrError, Result } from '../lib/utilities'
import { writable, Readable, Writable } from '../lib/utilities/stores'

import { InMemoryFSEntry } from './InMemoryFSEntry'

import type { SFError } from '../lib/SFError'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkEntry'
import type { InMemoryDirectory } from './InMemoryDirectory'

export class InMemoryFile
  extends InMemoryFSEntry
  implements StorageFrameworkFileEntry
{
  private data = new ArrayBuffer(0)
  private readonly observable: Writable<SFFile> = writable()

  constructor(parent: InMemoryDirectory, name: string) {
    super(parent, name)
  }

  get isDirectory(): false {
    return false
  }

  get isFile(): true {
    return true
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error) {
        reject(error)
        return
      }

      resolve(this.toSFFile())
    })
  }
  
  watchContent(): Result<Readable<SFFile>, SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error) {
        reject(error)
        return
      }

      resolve(this.observable)
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error) {
        reject(error)
        return
      }

      file
        .arrayBuffer()
        .then((data) => new Uint8Array(data).buffer)
        .then((data) => {
          this.data = data
          this.observable.set(this.toSFFile())
          resolve()
        })
        .catch(reject)
    })
  }

  private toSFFile(): SFFile {
    const data = new Uint8Array(this.data).buffer
    const file = new SFFile(this.name, 0, [data])
    return file
  }
}
