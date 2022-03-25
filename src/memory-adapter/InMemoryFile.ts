import { SFError } from '@lib/SFError'
import { SFFile } from '@lib/SFFile'
import { StorageFrameworkFileEntry } from '@lib/StorageFrameworkEntry'
import { OkOrError, Result } from '@lib/utilities'
import { InMemoryDirectory } from './InMemoryDirectory'
import { InMemoryFSEntry } from './InMemoryFSEntry'

export class InMemoryFile
  extends InMemoryFSEntry
  implements StorageFrameworkFileEntry
{
  isDirectory: false
  isFile: true

  private data = new ArrayBuffer(0)

  constructor(parent: InMemoryDirectory, name: string) {
    super(parent, name)
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
