import { SFError } from '../lib/SFError'
import type {
  StorageFrameworkEntry,
  StorageFrameworkProvider
} from '../lib/StorageFrameworkEntry'

import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'
import { Result } from '../lib/utilities/result'
import { LocalFallbackDirectoryEntry } from './local-fallback-fs-adapter/LocalFallbackDirectoryEntry'
import { LocalDirectoryEntry } from './LocalDirectoryEntry'
import { PathUtil } from '../lib/utilities/pathUtil'

export class LocalFileSystem implements StorageFrameworkProvider {
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result(async (resolve, reject) => {
      if (window.showDirectoryPicker) {
        try {
          const dirHandle = await window.showDirectoryPicker({
            multiple: true
          })
          resolve(
            new ReactivityDirDecorator(
              null,
              new LocalDirectoryEntry(dirHandle, null, true)
            )
          )
        } catch (err) {
          reject(new SFError('No directory provided', err))
        }
      } else {
        const el = document.createElement('input')
        el.setAttribute('type', 'file')
        el.setAttribute('webkitdirectory', 'true')
        el.setAttribute('multiple', 'true')
        el.click()

        el.onchange = (ev: any) => {
          let dirName
          if (ev.target?.files?.length)
            dirName = new PathUtil(ev.target.files[0].webkitRelativePath)
              .path[0]
          if (!dirName) {
            reject(
              new SFError(`No webkitdirectory found, received ${ev.target}`)
            )
          }
          resolve(
            new ReactivityDirDecorator(
              null,
              new LocalFallbackDirectoryEntry(dirName, ev.target.files, null)
            )
          )
        }
      }
    })
  }
}
