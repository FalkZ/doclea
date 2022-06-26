import type {
  BaseEntry,
  Entry,
  WritableDirectoryEntry,
  WritableFileEntry
} from '../new-interface/SFBaseEntry'
import type {
  TransactionalEntry,
  TransactionalWritableDirectoryEntry,
  TransactionalWritableFileEntry
} from '../new-interface/TransactionalEntry'
import type { SFError } from '../SFError'
import { SFFile } from '../SFFile'

import { Result, type OkOrError } from '../utilities'
import { downloadFile } from '../utilities/downloadFile'
import { writable, type Readable, type Writable } from '../utilities/stores'

abstract class ReactivityDecorator<E extends BaseEntry> {
  protected parent: ReactivityDirDecorator | null
  protected wrappedEntry: E

  public constructor(parent: ReactivityDirDecorator | null, wrappedEntry: E) {
    this.parent = parent
    this.wrappedEntry = wrappedEntry
  }

  public get _wrappedEntry(): E {
    return this.wrappedEntry
  }

  public get fullPath(): string {
    return this.wrappedEntry.fullPath
  }

  public get name(): string {
    return this.wrappedEntry.name
  }

  public getParent(): Result<TransactionalWritableDirectoryEntry, SFError> {
    return new Result((resolve) => {
      // @ts-expect-error
      resolve(this.parent)
    })
  }

  public rename(name: string): OkOrError<SFError> {
    return this.wrappedEntry.rename(name).then(() => {
      this.parent?.notifyChildListeners()
    })
  }

  public delete(): OkOrError<SFError> {
    return this.wrappedEntry.delete().then(() => {
      // @ts-expect-error
      this.parent?.removeChild(this)
    })
  }
}

export class ReactivityFileDecorator
  extends ReactivityDecorator<WritableFileEntry>
  implements TransactionalWritableFileEntry
{
  private readonly isModifiedStore = writable(false)
  private data: Writable<SFFile> | null = null

  public watchContent(): Result<Readable<SFFile>, SFError> {
    const data = this.data
    if (data == null) {
      return this.wrappedEntry.read().then((file) => {
        this.data = writable(file)
        return this.data
      })
    } else {
      return new Result((resolve) => {
        resolve(data)
      })
    }
  }

  // ##################################################
  // # TransactionalWritableFileEntry

  public read(): Result<SFFile, SFError> {
    return this.watchContent().then((o) => o.get())
  }

  // @ts-expect-error
  public async updateContent(content: BlobPart): OkOrError<SFError> {
    const data = new SFFile(this.name, [content])
    if (this.data) this.data.set(data)
    else this.data = writable(data)

    this.isModifiedStore.set(true)
  }

  public saveContent(): OkOrError<SFError> {
    const data = this.data ? this.data.get() : new SFFile(this.name, [])
    return this.wrappedEntry
      .write(data)
      .then(() => this.isModifiedStore.set(false))
  }

  public downloadEntry(): OkOrError<SFError> {
    const f = this.data?.get()
    if (f) downloadFile(f)
  }

  public rename(name: string): OkOrError<SFError> {
    return super.rename(name).then(() => {
      this.data?.update((file) => new SFFile(name, [file]))
    })
  }

  public get isReadonly(): false {
    return this.wrappedEntry.isReadonly
  }

  public get wasModified(): Readable<boolean> {
    return this.isModifiedStore
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
  extends ReactivityDecorator<WritableDirectoryEntry>
  implements TransactionalWritableDirectoryEntry
{
  private children: Writable<TransactionalEntry[]> | null = null

  public watchChildren(): Result<Readable<TransactionalEntry[]>, SFError> {
    if (this.children == null) {
      return this.wrappedEntry.getChildren().then((innerChildren) => {
        const children = writable(innerChildren.map(this.decorateEntry))
        this.children = children

        return children
      })
    } else {
      return new Result((resolve) => {
        // @ts-expect-error
        resolve(this.children)
      })
    }
  }

  public get isReadonly(): false {
    // is a hack: dont remove the next line
    return this.wrappedEntry.isReadonly
  }

  // ##################################################
  // # TransactionalWritableDirectoryEntry

  public getChildren(): Result<TransactionalEntry[], SFError> {
    return this.watchChildren().then((observable) => observable.get())
  }

  public createFile(
    name: string
  ): Result<TransactionalWritableFileEntry, SFError> {
    const file = new SFFile(name, [])
    return this.wrappedEntry.createFile(file).then((innerEntry) => {
      const entry = this.decorateEntry(innerEntry) as ReactivityFileDecorator
      this.appendChild(entry)

      return entry
    })
  }

  public createDirectory(
    name: string
  ): Result<TransactionalWritableDirectoryEntry, SFError> {
    return this.wrappedEntry.createDirectory(name).then((innerEntry) => {
      const entry = this.decorateEntry(innerEntry) as ReactivityDirDecorator
      this.appendChild(entry)

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

  public appendChild(child: ReactivityDecorator<BaseEntry>): void {
    // @ts-expect-error
    this.children.update((children) => {
      // @ts-expect-error
      children.push(child)
      // @ts-expect-error
      child.parent = this
      return children
    })
  }

  public removeChild(child: TransactionalEntry): void {
    // @ts-expect-error
    this.children.update((c) => c.filter((n) => n !== child))
  }

  public notifyChildListeners(): void {
    // @ts-expect-error
    this.children.update((c) => c)
  }

  private decorateEntry(
    entry: Entry
  ): ReactivityDirDecorator | ReactivityFileDecorator {
    if (entry.isDirectory)
      return new ReactivityDirDecorator(this, entry as WritableDirectoryEntry)
    else return new ReactivityFileDecorator(this, entry as WritableFileEntry)
  }
}
