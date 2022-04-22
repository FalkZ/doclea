import { SFError } from '../lib/SFError'
import type { StorageFrameworkEntry } from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileSystem } from '../lib/StorageFrameworkFileSystem'
import { Result } from '../lib/utilities'
import LocalFallbackDirectoryEntry from './local-fallback-fs-adapter/LocalFallbackDirectoryEntry'
import { LocalDirectoryEntry } from './LocalDirectoryEntry'

export class LocalFileSystem implements StorageFrameworkFileSystem {
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result(async (resolve, reject) => {
      if (window.showDirectoryPicker) {
        const dirHandle = await window.showDirectoryPicker({
          multiple: true
        })
        resolve(new LocalDirectoryEntry(dirHandle, null, true))
      } else {
        const el = document.createElement('input')
        el.setAttribute('type', 'file')
        el.setAttribute('webkitdirectory', 'true')
        el.setAttribute('multiple', 'true')
        el.click()

        el.onchange = (ev) => {
          const dirName = ev.target.files.length
            ? '/' + ev.target.files[0].webkitRelativePath.split('/')[0]
            : ''
          resolve(
            new LocalFallbackDirectoryEntry(
              dirName,
              ev.target.files,
              true,
              null
            )
          )
        }
      }
    })
  }
}
