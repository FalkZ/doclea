import { assert, describe, expect, it, test } from 'vitest'
import { LocalFileSystem } from '../../src/local-fs-adapter/LocalFileSystem'
import { MockFileSystemDirectoryHandle } from '../../mocks/src/MockFileSystemDirectoryHandle'
import { showDirectoryPickerFactory } from '../../mocks/src/showOpenFilePicker'

// import wait from 'wait-for-sigint'
import { runInBrowser } from '../utils'
import { select_option, time_ranges_to_array } from 'svelte/internal'
import { MockFileSystemFileHandle } from '../../mocks/src/MockFileSystemWritableFileStream'
import { StorageFrameworkDirectoryEntry } from '../../src/lib/StorageFrameworkEntry'
import { LocalDirectoryEntry } from '../../src/local-fs-adapter/LocalDirectoryEntry'

// https://www.chaijs.com/api/assert/
describe('LocalDirectoryEntry', () => {
  it('returns the children it contains', async () => {
    const testFileName1 = 'test.md'
    const testFileName2 = 'test2.md'
    globalThis.showDirectoryPicker = showDirectoryPickerFactory(
      Promise.resolve(
        new MockFileSystemDirectoryHandle('test Directory', [
          new MockFileSystemFileHandle(
            testFileName1,
            new File(['content of test file 1'], testFileName1)
          ),
          new MockFileSystemFileHandle(
            testFileName2,
            new File(['content of test file 2'], testFileName2)
          ),
        ])
      )
    )
    let rootHandle: FileSystemDirectoryHandle =
      await globalThis.showDirectoryPicker()
    let root: LocalDirectoryEntry = new LocalDirectoryEntry(
      rootHandle,
      null,
      true
    )
    let childs = await root.getChildren()

    assert(
      childs.length == 2,
      `Expected 2 children, got ${childs.length}. Children: ${childs.map(
        (ch) => ch.name
      )}`
    )
    assert(childs[0].name === testFileName1)
    assert(childs[1].name === testFileName2)
  })

  it('returns its relative path', async () => {
    const segment3 = new MockFileSystemDirectoryHandle('pathSegment3', [])
    const segment2 = new MockFileSystemDirectoryHandle('pathSegment2', [
      segment3,
    ])
    const segment1 = new MockFileSystemDirectoryHandle('pathSegment1', [
      segment2,
    ])
    const rootHandle = new MockFileSystemDirectoryHandle('rootHandle', [
      segment1,
    ])
    const root = new LocalDirectoryEntry(rootHandle, null, true)
    let children = await root.getChildren()
    let lastChild: LocalDirectoryEntry
    while (children.length) {
      lastChild = <LocalDirectoryEntry>children[0]
      children = await lastChild.getChildren()
    }

    assert(
      lastChild.fullPath ===
        '/rootHandle/pathSegment1/pathSegment2/pathSegment3',
      `Unexpected path: ${lastChild.fullPath}`
    )
  })
})
