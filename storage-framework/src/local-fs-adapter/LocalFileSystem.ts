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

/*
{
  "name": "doclea",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "chai": "^4.3.6",
    "puppeteer": "^13.5.1",
    "tslib": "^2.3.1",
    "typescript": "^4.5.4",
    "vite": "^2.8.0",
    "vitest": "^0.7.11"
  }
}
*/
