import { SFError } from '../lib/SFError'
import type { StorageFrameworkEntry } from '@lib/StorageFrameworkEntry'
import type { StorageFrameworkFileSystem } from '@lib/StorageFrameworkFileSystem'
import { Result } from '../lib/utilities'
import BrowserDirectoryEntry from './BrowserDirectoryEntry'

window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem
window.directoryEntry = window.directoryEntry || window.webkitDirectoryEntry

export class BrowserFileSystem implements StorageFrameworkFileSystem {
  SIZE_MB = 15
  SIZE_BYTE = this.SIZE_MB * 1024 ** 2
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve, reject) => {
      window.requestFileSystem(Window.PERSISTENT, this.SIZE_BYTE, (fs) => {
        fs.root.getDirectory(
          'base',
          { create: true },
          (directoryEntry) =>
            resolve(new BrowserDirectoryEntry(directoryEntry)),
          (err) => reject(new SFError(`Failed to create root directory`, err))
        )
      })
    })
  }
}
