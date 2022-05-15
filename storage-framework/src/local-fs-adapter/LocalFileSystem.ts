import type { SFError } from '../lib/SFError'
import type {
  ObservableStorageFrameworkDirectoryEntry,
  StorageFrameworkProvider
} from '../lib/StorageFrameworkEntry'

import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import { Result } from '../lib/utilities/result'
import { LocalFallbackDirectoryEntry } from './local-fallback-fs-adapter/LocalFallbackDirectoryEntry'
import { LocalDirectoryEntry } from './LocalDirectoryEntry'

export class LocalFileSystem implements StorageFrameworkProvider {
  open(): Result<ObservableStorageFrameworkDirectoryEntry, SFError> {
    return new Result(async (resolve) => {
      if (window.showDirectoryPicker) {
        const dirHandle = await window.showDirectoryPicker({
          multiple: true
        })
        resolve(
          new ReactivityDirDecorator(
            null,
            new LocalDirectoryEntry(dirHandle, null, true)
          )
        )
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
            new ReactivityDirDecorator(
              null,
              new LocalFallbackDirectoryEntry(
                dirName,
                ev.target.files,
                true,
                null
              )
            )
          )
        }
      }
    })
  }
}
