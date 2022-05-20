import { SFFile } from '../lib/SFFile'
import { Result, type OkOrError } from '../lib/utilities'

import { InMemoryFSEntry } from './InMemoryFSEntry'

import type { SFError } from '../lib/SFError'
import { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'

/**
 * Contains all methods for InMemoryFile
 */
export class InMemoryFile
  extends InMemoryFSEntry
  implements StorageFrameworkFileEntry
{
  isReadonly: false = false

  private data = new ArrayBuffer(0)

  /**
   * Gets if entry is a directory or not
   * @returns {boolean[]}
   */
  get isDirectory(): false {
    return false
  }

  /**
   * Gets if entry is a file or not
   * @returns {boolean[]}
   */
  get isFile(): true {
    return true
  }

  /**
   * Reads file
   * @returns {SFFile} on success
   * @returns {SFError} on error
   */
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

  /**
   * Saves file
   * @param {File} file
   * @returns {SFError} on error
   */
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
