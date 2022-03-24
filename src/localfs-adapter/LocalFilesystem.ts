import { SFError } from '@lib/SFError'
import type { StorageFrameworkEntry } from '@lib/StorageFrameworkEntry'
import { StorageFrameworkFileSystem } from '@lib/StorageFrameworkFileSystem'
import { Result } from '@lib/utilities'
import LocalDirectoryEntry from './LocalDirectoryEntry'

window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem
window.directoryEntry = window.directoryEntry || window.webkitDirectoryEntry

export class LocalFileSystem implements StorageFrameworkFileSystem {
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      window.requestFileSystem(Window.PERSISTENT, 1024 ** 2, (fs) => {
        fs.root.getDirectory(
          'base',
          { create: true },
          function (directoryEntry) {
            resolve(new LocalDirectoryEntry(directoryEntry))
          },
          (err) => reject(new SFError(`Failed to create root directory`, err))
        )
      })
    })
  }
}
