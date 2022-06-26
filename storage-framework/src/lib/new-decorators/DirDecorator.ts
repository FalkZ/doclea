import {
  DirectoryEntry,
  Entry,
  WritableDirectoryEntry,
  type FileEntry
} from '../new-interface/SFBaseEntry'
import {
  TransactionalEntry,
  TransactionalWritableDirectoryEntry,
  type TransactionalWritableFileEntry
} from '../new-interface/TransactionalEntry'
import { SFError } from '../SFError'
import type { SFFile } from '../SFFile'
import { OkOrError, Result } from '../utilities'
import { Readable, writable, type Writable } from '../utilities/stores'
import {
  BaseTransactionalDecorator,
  type BaseEntryState,
  type TransactionalDecoratorEntry
} from './BaseDecorator'

export const decorateDirectory = (
  innerEntry: DirectoryEntry
): TransactionalDirDecorator =>
  new TransactionalDirDecorator(
    stateFromInnerEntry(null, innerEntry),
    stateFromInnerEntry(null, innerEntry)
  )

// ================================================================================
// STATE

interface DirEntryState extends BaseEntryState {
  readonly innerEntry: DirectoryEntry | null
  children: Writable<TransactionalDecoratorEntry[]> | null
}

const stateFromInnerEntry = (
  parent: TransactionalDirDecorator | null,
  innerEntry: DirectoryEntry
): DirEntryState => ({
  innerEntry: innerEntry,
  parent: parent,
  children: null,
  name: innerEntry.name
})

const stateForNewEntry = (
  parent: TransactionalDirDecorator,
  name: string
): DirEntryState => ({
  innerEntry: null,
  parent: parent,
  children: writable([]),
  name: name
})

// ================================================================================
// DIRECTORY ENTRY

export class TransactionalDirDecorator
  extends BaseTransactionalDecorator<DirEntryState>
  implements TransactionalWritableDirectoryEntry
{
  public constructor(savedState: DirEntryState, currentState: DirEntryState) {
    super(savedState, currentState)
  }

  // ================================================================================
  // INTERNAL METHODS

  private getCurrentChildren(): Result<
    Writable<TransactionalDecoratorEntry[]>,
    SFError
  > {
    return new Result((resolve, reject) => {
      if (this.currentState.children != null) return this.currentState.children
    })
  }

  private appendEntry(
    name: string,
    lazyCreate: (name: string) => TransactionalDecoratorEntry
  ): Result<TransactionalDecoratorEntry, SFError> {
    return this.getCurrentChildren().then((children) => {
      const entryWithName = children.get().find((entry) => name === entry.name)
      if (entryWithName) throw new SFError(`name  ${name} already used`)

      const newEntry = lazyCreate(name)
      void children.update((c) => [...c, newEntry])

      this.isModified.set(true)
      return newEntry
    })
  }

  // ================================================================================
  // PERMANENT ACTIONS

  // ================================================================================
  // TEMPORARY ACTIONS

  public watchChildren(): Result<Readable<TransactionalEntry[]>, SFError> {
    return this.getCurrentChildren()
  }

  public createDirectory(
    name: string
  ): Result<TransactionalWritableDirectoryEntry, SFError> {
    return this.appendEntry(name, (name) => {
      const dir = new TransactionalDirDecorator(
        stateForNewEntry(this, name),
        stateForNewEntry(this, name)
      )

      return dir
    }) as Result<TransactionalWritableDirectoryEntry, SFError>
  }

  public createFile(
    name: string
  ): Result<TransactionalWritableFileEntry, SFError> {
    return this.appendEntry(name, (name) => {
      // TODO
      throw new Error('unimplemented')
    })
  }

  // TODO: remove
  // getChildren(): Result<Entry[], SFError> {
  //   return this.watchChildren().then((store) => store.get())
  // }

  getParent(): Result<DirectoryEntry, SFError> {
    throw new Error('Method not implemented.')
  }

  // ================================================================================
  // CHANGEABLE PROPERTIES

  public get isRoot(): boolean {
    return this.currentState.parent == null
  }

  // ================================================================================
  // CONSTANT PROPERTIES

  public get isReadonly(): false {
    return false
  }

  public get isDirectory(): true {
    return true
  }

  public get isFile(): false {
    return false
  }
}
