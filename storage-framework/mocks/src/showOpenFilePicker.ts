import { MockFileSystemDirectoryHandle } from './MockFileSystemDirectoryHandle'
// import { File } from 'File'
import { MockFileSystemFileHandle } from './MockFileSystemWritableFileStream'

//window.showOpenFilePicker()

interface ShowDirectoryPicker {
  (options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>
}

export type MockChildren = FileSystemDirectoryHandle | FileSystemFileHandle

export const showDirectoryPickerFactory =
  (mock): ShowDirectoryPicker =>
  () =>
    Promise.resolve(mock)

// example usage

globalThis.showDirectoryPicker = showDirectoryPickerFactory(
  Promise.resolve(
    new MockFileSystemDirectoryHandle('test Directory', [
      new MockFileSystemFileHandle(
        'test.md',
        new File(['content of file'], 'test.md')
      )
    ])
  )
)
