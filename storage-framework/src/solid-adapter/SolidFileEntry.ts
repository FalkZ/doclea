import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type {
  StorageFrameworkDirectoryEntry,
  StorageFrameworkFileEntry
} from '../lib/StorageFrameworkEntry'
import { Result, type OkOrError } from '../lib/utilities'
import type { SolidDirectoryEntry } from './SolidDirectoryEntry'
import { saveFileInContainer, deleteFile, getFile } from '@inrupt/solid-client'

import type { Readable } from 'src/lib/utilities/stores'

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

  watchContent(): Result<Readable<SFFile>, SFError> {
    throw new Error('Method not implemented.')
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
    return new Result((resolve, reject) => {
      this.moveFileToContainer(directory)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to move file`, err)))
    })
  }
  rename(name: string): OkOrError<SFError> {
    return new Result((resolve, reject) => {
      this.renameFile(name)
        .then(() => resolve())
        .catch((err) => reject(new SFError(`Failed to rename file`, err)))
    })
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

  async renameFile(name: string) {
    const file = await getFile(this.fullPath, { fetch: fetch })

    type file = Awaited<ReturnType<typeof getFile>>

    let fileName = this.getFileName(file.internal_resourceInfo.sourceIri)
    let newFileName = this.replaceFileNameWithNewName(fileName, name)
    file.internal_resourceInfo.sourceIri =
      file.internal_resourceInfo.sourceIri.replace(fileName, '')
    const renamedFile = await saveFileInContainer(
      file.internal_resourceInfo.sourceIri,
      file,
      { slug: newFileName, fetch: fetch }
    )
    this.name = renamedFile.internal_resourceInfo.sourceIri
  }

  //There is also an overwriteFile function which overwrites the file
  //if it exists and creates the containers which are in the url but not in the pod
  async saveFile(file: File) {
    await saveFileInContainer(this.parent.fullPath, file)
  }

  async deleteFile() {
    await deleteFile(this.fullPath, { fetch: fetch })
  }

  async moveFileToContainer(directory: StorageFrameworkDirectoryEntry) {
    const file = await getFile(this.fullPath, { fetch: fetch })
    type file = Awaited<ReturnType<typeof getFile>>
    return await saveFileInContainer(directory.fullPath, file, {
      slug: this.getFileName(file.internal_resourceInfo.sourceIri),
      fetch: fetch
    })
  }

  replaceFileNameWithNewName(fileName: string, newName: string): string {
    let match = fileName.match('(.+?)(.[^.]*$|$)')[0]
    return fileName.replace(match, newName)
  }

  getFileName(url: string): string {
    return url.match('([^/]+)(?=[^/]*/?$)')[0]
  }
}
