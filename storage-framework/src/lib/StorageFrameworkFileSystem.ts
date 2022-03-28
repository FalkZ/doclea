import type { SFError } from './SFError'
import type { StorageFrameworkEntry } from './StorageFrameworkEntry'
import type { Result } from './utilities'

export interface StorageFrameworkFileSystem {
  open(): Result<StorageFrameworkEntry, SFError>
}
