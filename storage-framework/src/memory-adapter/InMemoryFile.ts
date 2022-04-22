import { SFFile } from '../lib/SFFile'
import { OkOrError, Result } from '../lib/utilities'
import { InMemoryFSEntry } from './InMemoryFSEntry'

import type { SFError } from '../lib/SFError'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkEntry'
import type { InMemoryDirectory } from './InMemoryDirectory'

export class InMemoryFile
  extends InMemoryFSEntry
  implements StorageFrameworkFileEntry
{
  private data = new ArrayBuffer(0)

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

      let data = new Uint8Array(this.data).buffer
      let file = new SFFile(this.name, 0, [data])
      resolve(file)
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
          resolve()
        })
        .catch(reject)
    })
  }
}
