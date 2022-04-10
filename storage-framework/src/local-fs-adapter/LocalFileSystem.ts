import { SFError } from '../lib/SFError'
import type { StorageFrameworkEntry } from '../lib/StorageFrameworkEntry'
import type { StorageFrameworkFileSystem } from '../lib/StorageFrameworkFileSystem'
import { Result } from '../lib/utilities'
import { LocalDirectoryEntry } from './LocalDirectoryEntry'
//import LocalLegacyDirectoryEntry from './legacy/LocalLegacyDirectoryEntry'

export class LocalFileSystem implements StorageFrameworkFileSystem {
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result(async (resolve, reject) => {
      if (window.showDirectoryPicker) {
        const dirHandle = await window.showDirectoryPicker({
          multiple: true
        })
        resolve(new LocalDirectoryEntry(dirHandle))
      } else {
        const el = document.createElement('input')
        el.setAttribute('type', 'file')
        el.setAttribute('webkitdirectory', 'true')

        el.click()

        el.onchange = (ev) => {
          console.log(ev.target)
          //resolve(new LocalLegacyDirectoryEntry(ev.target.files))
        }
      }
    })
  }
}
