import { SFError } from '../lib/SFError'
import { SFFile } from '../lib/SFFile'
import type { StorageFrameworkDirectoryEntry } from '../lib/StorageFrameworkEntry'
import { StorageFrameworkFileEntry } from '../lib/StorageFrameworkFileEntry'
import type { SolidDirectoryEntry } from './SolidDirectoryEntry'
import { saveFileInContainer, deleteFile, getFile } from '@inrupt/solid-client'

import { Result, type OkOrError } from '../lib/utilities/result'

type SolidFile = Awaited<ReturnType<typeof getFile>>

export class SolidFileEntry implements StorageFrameworkFileEntry {
  fullPath: string
  readonly isDirectory: false
  readonly isFile: true
  name: string
  private readonly parent: SolidDirectoryEntry
  private readonly file: FileSystemFileEntry

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
        reject(new SFError(`Failed to get parent of ${this.fullPath}`))
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

  async renameFile(name: string): Promise<void> {
    const file: SolidFile = await getFile(this.fullPath, { fetch: fetch })

    const fileName = this.getFileName(file.internal_resourceInfo.sourceIri)
    const newFileName = this.replaceFileNameWithNewName(fileName, name)
    file.internal_resourceInfo.sourceIri =
      file.internal_resourceInfo.sourceIri.replace(fileName, '')
    const renamedFile = await saveFileInContainer(
      file.internal_resourceInfo.sourceIri,
      file,
      { slug: newFileName, fetch: fetch }
    )
    this.name = renamedFile.internal_resourceInfo.sourceIri
  }

  // There is also an overwriteFile function which overwrites the file
  // if it exists and creates the containers which are in the url but not in the pod
  async saveFile(file: File): Promise<void> {
    await saveFileInContainer(this.parent.fullPath, file)
  }

  async deleteFile(): Promise<void> {
    await deleteFile(this.fullPath, { fetch: fetch })
  }

  async moveFileToContainer(
    directory: StorageFrameworkDirectoryEntry
  ): Promise<SolidFile> {
    const file: SolidFile = await getFile(this.fullPath, { fetch: fetch })

    return await saveFileInContainer(directory.fullPath, file, {
      slug: this.getFileName(file.internal_resourceInfo.sourceIri),
      fetch: fetch
    })
  }

  replaceFileNameWithNewName(fileName: string, newName: string): string {
    /*
     * TODO: use /regex/ syntax for regexes
     * create a utility function in lib that can be used for github owner and repo fields
     */
    const match = fileName.match('(.+?)(.[^.]*$|$)')[0]
    return fileName.replace(match, newName)
  }

  getFileName(url: string): string {
    /*
     * TODO: use new Url()
     */
    return url.match('([^/]+)(?=[^/]*/?$)')[0]
  }
}
