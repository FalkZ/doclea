import { SFError } from '../lib/SFError'
import {
  StorageFrameworkEntry,
  StorageFrameworkProvider,
} from '../lib/StorageFrameworkEntry'
import { Result } from '../lib/utilities'
import { InMemoryDirectory } from './InMemoryDirectory'

export class InMemoryFileSystem implements StorageFrameworkProvider {
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve) => {
      let root = new InMemoryDirectory(null, null)
      initSamples(root).then((_) => resolve(root))
    })
  }
}

const initSamples = async (root: InMemoryDirectory) => {
  let studiumDir = await root.createDirectory('Studium')
  {
    let todo = await studiumDir.createFile('TODOs.MD')
    let content = `
    # TODO

    there's a lot of work left: have a look at the github issue board:
    [Github](https://github.com/FalkZ/doclea/issues)
    `.replace(/^[ \t]+/gm, '')
    todo.save(new File([content], '', {}))
  }
  let sem6 = await studiumDir.createDirectory('Semester 6')
  {
    let readme = await sem6.createFile('README.MD')
    let content = `
    # Sample README

    this is an example from the in memory file system
    `.replace(/^[ \t]+/gm, '')
    readme.save(new File([content], '', {}))
  }
}
