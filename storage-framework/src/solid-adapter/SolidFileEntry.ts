import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, OkOrError } from '../lib/utilities'
import { SolidDirectoryEntry } from './SolidDirectoryEntry'
import {
  saveFileInContainer,
  overwriteFile,
  deleteFile,
  getFile
} from '@inrupt/solid-client'

export class SolidFileEntry implements StorageFrameworkFileEntry {
  fullPath: string
  readonly isDirectory: false
  readonly isFile: true
  name: string
  private parent: SolidDirectoryEntry
  private file: FileSystemFileEntry

  constructor(fullPath: string, name: string, parent: SolidDirectoryEntry) {
    this.fullPath = fullPath
    this.name = name
    this.parent = parent
  }
  read(): Result<SFFile, SFError> {
    return new Result((resolve, reject) => {
      this.file.file(
        (file) => {
          resolve(new SFFile(this.name, null, [file]))
        },
        (err) => reject(new SFError('Failed to read file', err))
      )
    })
  }

  save(file: File): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.saveFile(file)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to save file`, err)))
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
    //let modifiedFile = new SFFile(name, null, [this.file.file])
    throw new Error('Method not implemented.')
  }
  remove(): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.deleteFile()
        .then(() => resolve())
        .catch((err) =>
          reject(new SFError(`Failed to remove ${this.fullPath}`, err))
        )
    })
  }

  //There is also an overwriteFile function which overwrites the file
  //if it exists and creates the containers which are in the url but not in the pod
  async saveFile(file: File) {
    await saveFileInContainer(this.parent.fullPath, file)
  }

  async overwriteFile(file: File) {
    await overwriteFile(this.fullPath, file)
  }

  async deleteFile() {
    await deleteFile(this.fullPath, { fetch: fetch })
  }

  async getFile() {
    await getFile(this.fullPath, { fetch: fetch })
  }
}
