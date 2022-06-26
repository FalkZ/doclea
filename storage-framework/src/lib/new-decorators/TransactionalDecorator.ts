import type { DirectoryEntry } from '../new-interface/SFBaseEntry'
import { TransactionalDirDecorator } from './DirDecorator'

/*
  QUESTIONS:

  ---
  on rename, how to enforce name uniqueness?
  - [-] name must not be present in currentState and savedState
  - [x] name must not be present in currentState
    -> [ ] appropriate error message on save if failing
  ---
  if entry is removed, but we have multiple references
  - [ ] make sure entry still exists/is valid before using it
  ---
  on createFile/createDirectory is t
*/

export const decorate = (rootDir: DirectoryEntry) =>
  new TransactionalDirDecorator()
