import { File } from 'File'

class MockFileSystemWritableFileStream implements FileSystemWritableFileStream {
  write(data: FileSystemWriteChunkType): Promise<void> {
    throw new Error('Method not implemented.')
  }
  seek(position: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  truncate(size: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  locked: boolean
  abort(reason?: any): Promise<void> {
    throw new Error('Method not implemented.')
  }

  close(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getWriter(): WritableStreamDefaultWriter<any> {
    throw new Error('Method not implemented.')
  }
}
export class MockFileSystemFileHandle implements FileSystemFileHandle {
  kind: 'file'
  isFile: true = true
  isDirectory: false = false
  name: string
  private file: File

  constructor(name: string, file: File) {
    this.name = name
    this.file = file
  }

  getFile(): Promise<File> {
    return Promise.resolve(this.file)
  }
  createWritable(
    options?: FileSystemCreateWritableOptions
  ): Promise<MockFileSystemWritableFileStream> {}

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
