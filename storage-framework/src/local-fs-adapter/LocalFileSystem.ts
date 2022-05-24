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

const selectFolder = (): Promise<File[]> =>
  new Promise<File[]>((resolve, reject) => {
    const el = document.createElement('input')
    el.setAttribute('type', 'file')
    el.setAttribute('webkitdirectory', 'true')
    el.setAttribute('multiple', 'true')

    el.addEventListener('change', () => {
      resolve([...el.files])
    })

    setTimeout((_) => {
      el.click()
      let counter = 0
      const onFocus = () => {
        counter += 1
        if (counter === 2) {
          window.removeEventListener('focus', onFocus)
          document.body.addEventListener('mousemove', onMouseMove)
        }
      }
      const onMouseMove = () => {
        document.body.removeEventListener('mousemove', onMouseMove)
        if (!el.files.length) {
          reject()
        }
      }
      window.addEventListener('focus', onFocus)
    }, 0)
  })

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
              new LocalDirectoryEntry(dirHandle, null)
            )
          )
        } catch (err) {
          reject(new SFError('No directory provided', err))
        }
      } else {
        try {
          const files = await selectFolder()

          if (files.length) {
            const dirName = files[0].webkitRelativePath.split('/')[0]

            resolve(
              new ReactivityDirDecorator(
                null,
                new LocalFallbackDirectoryEntry(dirName, files, null)
              )
            )
          }
        } catch (e) {
          reject(new SFError('Failed to open local file system'))
        }
      }
    })
  }
}
