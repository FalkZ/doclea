import { SFFile } from '../lib/SFFile'
import { Result, type OkOrError } from '../lib/utilities'

import { InMemoryFSEntry } from './InMemoryFSEntry'

import type { SFError } from '../lib/SFError'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkEntry'

export class InMemoryFile
  extends InMemoryFSEntry
  implements StorageFrameworkFileEntry
{
  private data = new ArrayBuffer(0)

  get isDirectory(): false {
    return false
  }

  get isFile(): true {
    return true
  }

  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error !== null) {
        reject(error)
        return
      }

      resolve(this.toSFFile())
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error !== null) {
        reject(error)
        return
      }

      file
        .arrayBuffer()
        .then((data) => new Uint8Array(data).buffer)
        .then((data) => {
          this.data = data
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
