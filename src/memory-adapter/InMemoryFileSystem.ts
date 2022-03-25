import { SFError } from '@lib/SFError'
import {
  StorageFrameworkEntry,
  StorageFrameworkProvider,
} from '@lib/StorageFrameworkEntry'
import { Result } from '@lib/utilities'
import { InMemoryDirectory } from './InMemoryDirectory'

export class InMemoryFileSystem implements StorageFrameworkProvider {
  open(): Result<StorageFrameworkEntry, SFError> {
    return new Result((resolve) => {
      resolve(new InMemoryDirectory(null, null))
    })
  }
}
