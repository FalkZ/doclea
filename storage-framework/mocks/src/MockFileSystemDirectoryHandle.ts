import { fromRdfJsDataset } from '@inrupt/solid-client'
import { MockChildren } from './showOpenFilePicker'

export class MockFileSystemDirectoryHandle
  implements FileSystemDirectoryHandle
{
  kind: 'directory'
  isFile: false = false
  isDirectory: true = true
  name: string
  private children: MockChildren[]

  constructor(name: string, children: MockChildren[]) {
    this.name = name
    this.children = children
    this.kind = 'directory'
  }
  getFile = (name: string, options?: FileSystemGetFileOptions) =>
    this.getFileHandle(name, options)

  getDirectory = (name: string, options?: FileSystemGetDirectoryOptions) =>
    this.getDirectoryHandle(name, options)

  getEntries: () => AsyncIterableIterator<
    FileSystemDirectoryHandle | FileSystemFileHandle
  >;

  [Symbol.asyncIterator]: () => AsyncIterableIterator<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle]
  >

  private find(name, directory?: boolean) {
    const match = this.children.find(
      (child) =>
        child.name === name && (directory ? child.isDirectory : child.isFile)
    )
    if (!match) return Promise.reject(new Error(`could not get "${name}"`))
    return Promise.resolve(match)
  }
  getDirectoryHandle(
    name: string,
    options?: FileSystemGetDirectoryOptions
  ): Promise<FileSystemDirectoryHandle> {
    // @ts-ignore
    return this.find(name, true)
  }
  getFileHandle(
    name: string,
    options?: FileSystemGetFileOptions
  ): Promise<FileSystemFileHandle> {
    // @ts-ignore
    return this.find(name, true)
  }
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  resolve(possibleDescendant: FileSystemHandle): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  keys(): AsyncIterableIterator<string> {
    throw new Error('Method not implemented.')
  }
  values(): AsyncIterableIterator<
    FileSystemDirectoryHandle | FileSystemFileHandle
  > {
    throw new Error('Method not implemented.')
  }

  entries(): AsyncIterableIterator<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle]
  > {
    let it = {
      ob: this.children,
      from: 0,
      to: this.children.length,
      next() {
        let curr = this.from
        this.from++
        if (curr < this.to) {
          return Promise.resolve({
            done: false,
            value: [this.from, this.ob[curr]],
          })
        } else {
          return Promise.resolve({
            done: true,
            value: undefined,
          })
        }
      },
      [Symbol.asyncIterator]: () => it,
    }
    return it
  }

  [Symbol.asyncIterator]: () => AsyncIterableIterator<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle]
  >

  isSameEntry(other: FileSystemHandle): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState> {
    throw new Error('Method not implemented.')
  }
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState> {
    throw new Error('Method not implemented.')
  }
}
