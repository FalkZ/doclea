import { SFFile } from '../lib/SFFile'
import { Result, type OkOrError } from '../lib/utilities'

import { InMemoryFSEntry } from './InMemoryFSEntry'

import type { SFError } from '../lib/SFError'
import type { StorageFrameworkFileEntry } from '../lib/StorageFrameworkEntry'
import type { InMemoryDirectory } from './InMemoryDirectory'

export class InMemoryFile
  extends InMemoryFSEntry
  implements StorageFrameworkFileEntry
{
  private data = new ArrayBuffer(0)

  // disable is required because parent must not be null for InMemoryFiles
  // what is not true for InMemoryDirectories
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(parent: InMemoryDirectory, name: string) {
    super(parent, name)
  }

  public get isDirectory(): false {
    return false
  }

  public get isFile(): true {
    return true
  }

  public read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      const error = this.verifyNodeIsAttachedToRoot()
      if (error !== null) {
        reject(error)
        return
      }

      resolve(this.toSFFile())
    })
  }

  public save(file: File): OkOrError<SFError> {
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
