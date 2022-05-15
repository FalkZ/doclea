import { Result } from '../lib/utilities'
import { InMemoryDirectory } from './InMemoryDirectory'
import type { SFError } from '../lib/SFError'
import type {
  ObservableStorageFrameworkDirectoryEntry,
  StorageFrameworkProvider,
} from '../lib/StorageFrameworkEntry'
import { ReactivityDirDecorator } from '../lib/wrappers/ReactivityDecorator'

export class InMemoryFileSystem implements StorageFrameworkProvider {
  open(): Result<ObservableStorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve) => {
      const root = new InMemoryDirectory(null, null)
      void initSamples(root).then((_) =>
        resolve(new ReactivityDirDecorator(null, root))
      )
    })
  }
}

const initSamples = async (root: InMemoryDirectory): Promise<void> => {
  const studiumDir = await root.createDirectory('Studium')
  {
    const todo = await studiumDir.createFile('TODOs.MD')
    const content = `
    # TODO

    there's a lot of work left: have a look at the github issue board:
    [Github](https://github.com/FalkZ/doclea/issues)
    `.replace(/^[ \t]+/gm, '')
    void todo.save(new File([content], '', {}))
  }
  const sem6 = await studiumDir.createDirectory('Semester 6')
  {
    const readme = await sem6.createFile('README.MD')
    const content = `
    # Sample README

    this is an example from the in memory file system
    `.replace(/^[ \t]+/gm, '')
    void readme.save(new File([content], '', {}))
  }
}
