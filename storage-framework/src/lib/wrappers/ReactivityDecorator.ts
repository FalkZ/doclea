import type { SFError } from '../SFError'
import { duplicateFile, type SFFile } from '../SFFile'
import type {
  ObservableStorageFrameworkDirectoryEntry,
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry
} from '../StorageFrameworkEntry'
import type {
  ObservableStorageFrameworkFileEntry,
  StorageFrameworkFileEntry
} from '../StorageFrameworkFileEntry'
import { Result, type OkOrError } from '../utilities'
import { writable, type Readable, type Writable } from '../utilities/stores'

/**
 * Base abstract decorator
 */
abstract class ReactivityDecorator<E extends StorageFrameworkEntry>
  implements StorageFrameworkEntry
{
  protected parent: ReactivityDirDecorator | null
  protected wrappedEntry: E

  public constructor(parent: ReactivityDirDecorator | null, wrappedEntry: E) {
    this.parent = parent
    this.wrappedEntry = wrappedEntry
  }

  public get fullPath(): string {
    return this.wrappedEntry.fullPath
  }

  public get name(): string {
    return this.wrappedEntry.name
  }

  public getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve) => {
      resolve(this.parent)
    })
  }

  public rename(name: string): OkOrError<SFError> {
    return this.wrappedEntry.rename(name).then(() => {
      this.parent.notifyChildListeners()
    })
  }

  public moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    const dir = directory as ReactivityDirDecorator
    return this.wrappedEntry.moveTo(dir.wrappedEntry).then(() => {
      this.parent.removeChild(this)
      dir.appendChild(dir)
      this.parent = dir
    })
  }

  public remove(): OkOrError<SFError> {
    return this.wrappedEntry.remove().then(() => {
      this.parent.removeChild(this)
    })
  }
}

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ReactivityDecorator<E extends StorageFrameworkEntry>
  extends StorageFrameworkEntry {}

export class ReactivityFileDecorator
  extends ReactivityDecorator<StorageFrameworkFileEntry>
  implements ObservableStorageFrameworkFileEntry
{
  private data: Writable<SFFile> | null

  public watchContent(): Result<Readable<SFFile>, SFError> {
    if (this.data == null) {
      return this.wrappedEntry.read().then((file) => {
        this.data = writable(file)
        return this.data
      })
    } else {
      return new Result((resolve) => {
        resolve(this.data)
      })
    }
  }

  // ##################################################
  // # StorageFrameworkFileEntry

  public read(): Result<SFFile, SFError> {
    return this.watchContent().then((o) => o.get())
  }

  public update(file: File): OkOrError<SFError> {
    return this.wrappedEntry.update(file).then(() => {
      void duplicateFile(file).then((duplicate) => this.data.set(duplicate))
    })
  }

  public save(file: File): OkOrError<SFError> {
    return this.wrappedEntry.save(file)
  }

  public get isReadonly(): false {
    return this.wrappedEntry.isReadonly
  }

  public get wasModified(): boolean {
    return this.wrappedEntry.wasModified
  }

  public get isDirectory(): false {
    return false
  }

  public get isFile(): true {
    return true
  }

  // ##################################################
  // # ADDITIONAL METHODS
}

export class ReactivityDirDecorator
  extends ReactivityDecorator<StorageFrameworkDirectoryEntry>
  implements ObservableStorageFrameworkDirectoryEntry
{
  private children: Writable<StorageFrameworkEntry[]> | null = null

  public watchChildren(): Result<Readable<StorageFrameworkEntry[]>, SFError> {
    if (this.children == null) {
      return this.wrappedEntry.getChildren().then((children) => {
        this.children = writable(children.map(this.decorateEntry))
        console.log('has children ', children)
        return this.children
      })
    } else {
      return new Result((resolve) => {
        resolve(this.children)
      })
    }
  }

  // ##################################################
  // # StorageFrameworkDirectoryEntry

  public getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return this.watchChildren().then((observable) => observable.get())
  }

  public createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return this.wrappedEntry.createFile(name).then((entry) => {
      this.appendChild(this.decorateEntry(entry))

      return entry
    })
  }

  public createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return this.wrappedEntry.createDirectory(name).then((entry) => {
      this.appendChild(this.decorateEntry(entry))

      return entry
    })
  }

  public get isRoot(): boolean {
    return this.wrappedEntry.isRoot
  }

  public get isDirectory(): true {
    return true
  }

  public get isFile(): false {
    return false
  }

  // ##################################################
  // # ADDITIONAL METHODS

  public appendChild(child: ReactivityDecorator<any>): void {
    this.children.update((children) => {
      children.push(child)
      child.parent = this
      return children
    })
  }

  public removeChild(child: StorageFrameworkEntry): void {
    this.children.update((c) => c.filter((n) => n !== child))
  }

  public notifyChildListeners(): void {
    this.children.update((c) => c)
  }

  private decorateEntry(
    entry: StorageFrameworkEntry
  ): ReactivityDecorator<any> {
    if (entry.isDirectory)
      return new ReactivityDirDecorator(
        this,
        entry as StorageFrameworkDirectoryEntry
      )
    else if (entry.isFile)
      return new ReactivityFileDecorator(
        this,
        entry as StorageFrameworkFileEntry
      )
  }
}
