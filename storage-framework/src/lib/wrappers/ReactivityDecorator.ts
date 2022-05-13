import type { SFError } from '../SFError'
import { duplicateFile, type SFFile } from '../SFFile'
import type {
  ObservableStorageFrameworkDirectoryEntry,
  ObservableStorageFrameworkFileEntry,
  StorageFrameworkDirectoryEntry,
  StorageFrameworkEntry,
  StorageFrameworkFileEntry,
} from '../StorageFrameworkEntry'
import { Result, type OkOrError } from '../utilities'
import { writable, type Readable, type Writable } from '../utilities/stores'

abstract class ReactivityDecorator<E extends StorageFrameworkEntry>
  implements StorageFrameworkEntry
{
  parent: ReactivityDirDecorator | null
  wrappedEntry: E

  constructor(parent: ReactivityDirDecorator | null, wrappedEntry: E) {
    this.parent = parent
    this.wrappedEntry = wrappedEntry
  }

  get fullPath(): string {
    return this.wrappedEntry.fullPath
  }

  get name(): string {
    return this.wrappedEntry.name
  }

  getParent(): Result<StorageFrameworkDirectoryEntry, SFError> {
    return new Result((resolve) => {
      resolve(this.parent)
    })
  }

  rename(name: string): OkOrError<SFError> {
    return this.wrappedEntry.rename(name).then(() => {
      this.parent.notifyChildListeners()
    })
  }

  moveTo(directory: StorageFrameworkDirectoryEntry): OkOrError<SFError> {
    const dir = directory as ReactivityDirDecorator
    return this.wrappedEntry.moveTo(dir.wrappedEntry).then(() => {
      this.parent.removeChild(this)
      dir.appendChild(dir)
      this.parent = dir
    })
  }

  remove(): OkOrError<SFError> {
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
  data: Writable<SFFile> | null

  watchContent(): Result<Readable<SFFile>, SFError> {
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

  read(): Result<SFFile, SFError> {
    return this.watchContent().then((o) => o.get())
  }

  save(file: File): OkOrError<SFError> {
    return this.wrappedEntry.save(file).then(() => {
      void duplicateFile(file).then((duplicate) => this.data.set(duplicate))
    })
  }

  get isDirectory(): false {
    return false
  }

  get isFile(): true {
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

  watchChildren(): Result<Readable<StorageFrameworkEntry[]>, SFError> {
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

  getChildren(): Result<StorageFrameworkEntry[], SFError> {
    return this.watchChildren().then((observable) => observable.get())
  }

  createFile(name: string): Result<StorageFrameworkFileEntry, SFError> {
    return this.wrappedEntry.createFile(name).then((entry) => {
      this.appendChild(this.decorateEntry(entry))

      return entry
    })
  }

  createDirectory(
    name: string
  ): Result<StorageFrameworkDirectoryEntry, SFError> {
    return this.wrappedEntry.createDirectory(name).then((entry) => {
      this.appendChild(this.decorateEntry(entry))

      return entry
    })
  }

  get isRoot(): boolean {
    return this.wrappedEntry.isRoot
  }

  get isDirectory(): true {
    return true
  }

  get isFile(): false {
    return false
  }

  // ##################################################
  // # ADDITIONAL METHODS

  appendChild(child: ReactivityDecorator<any>): void {
    this.children.update((children) => {
      children.push(child)
      child.parent = this
      return children
    })
  }

  removeChild(child: StorageFrameworkEntry): void {
    this.children.update((c) => c.filter((n) => n !== child))
  }

  notifyChildListeners(): void {
    this.children.update((c) => c)
  }

  decorateEntry(entry: StorageFrameworkEntry): ReactivityDecorator<any> {
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
