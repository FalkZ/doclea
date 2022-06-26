import type { DirectoryEntry } from '../new-interface/SFBaseEntry'
import {
  TransactionalEntry,
  TransactionalWritableDirectoryEntry,
  type TransactionalDirectoryEntry,
  type TransactionalWritableFileEntry
} from '../new-interface/TransactionalEntry'
import { SFError } from '../SFError'
import type { SFFile } from '../SFFile'
import { OkOrError, Result } from '../utilities'
import { Readable, writable } from '../utilities/stores'
import type { TransactionalDirDecorator } from './DirDecorator'
import type { TransactionalFileDecorator } from './FileDecorator'

export type TransactionalDecoratorEntry =
  | TransactionalDirDecorator
  | TransactionalFileDecorator

export interface BaseEntryState {
  parent: TransactionalDirDecorator | null
  name: string
}

export abstract class BaseTransactionalDecorator<S extends BaseEntryState> {
  protected readonly isModified = writable(false)

  protected savedState: S
  protected currentState: S

  public constructor(savedState: S, currentState: S) {
    this.savedState = savedState
    this.currentState = currentState
  }

  // ================================================================================
  // INTERNAL METHODS

  // ================================================================================
  // PERMANENT ACTIONS

  public saveEntry(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  public delete(): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  public moveTo(
    directory: TransactionalWritableDirectoryEntry
  ): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  public updateName(name: string): OkOrError<SFError> {
    throw new Error('Method not implemented.')
  }

  // ================================================================================
  // TEMPORARY ACTIONS

  // ================================================================================
  // CHANGEABLE PROPERTIES

  public get wasModified(): Readable<boolean> {
    return this.isModified
  }

  public get name(): string {
    return this.currentState.name
  }

  public get fullPath(): string {
    const parent = this.currentState.parent

    if (parent == null) return '/'
    else return parent.fullPath + this.name + '/'
  }
}
