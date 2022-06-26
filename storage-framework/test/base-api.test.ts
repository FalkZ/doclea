import { GithubFileSystem, LocalFileSystem, SolidFileSystem } from '../dist/esm'
import { expect } from 'browser-unit-test'
import type { StorageFrameworkFileEntry } from '../dist/types'
import type {
  DirectoryEntry,
  Entry,
  WritableFileEntry
} from '../src/lib/new-interface/SFBaseEntry'

import type {
  TransactionalDirectoryEntry,
  TransactionalFileEntry,
  TransactionalWritableFileEntry
} from '../src/lib/new-interface/TransactionalEntry'

const awaitClick = () =>
  new Promise<void>((resolve) => {
    const listener = () => {
      window.removeEventListener('click', listener)
      resolve()
    }
    window.addEventListener('click', listener)
  })

const cleanup = async (parent) => {
  const d = await getChild(parent, 'docs')

  const f = await getChild(d, 'test_file.txt')

  if (f) await f.delete()
}

const getChild = async (parent: DirectoryEntry, key: string) => {
  const children = await parent.getChildren()

  expect(children).to.be.an('array')

  return children.find(({ name }) => name === key)
}

let _local
const createNewLocal = async () => {
  if (_local) return _local
  console.log('waiting on click to open local file system...')
  await awaitClick()
  _local = await new LocalFileSystem().open()

  return _local
}
export const beforeEach = {
  github: async () => {
    const provider = new GithubFileSystem({
      clientId: 'b0febf46067600eed6e5',
      clientSecret: '228480a8a7eae9aed8299126211402f47c488013'
    })

    if (await provider.isAuthenticated) {
      const fs = await provider.open('https://github.com/FalkZ/doclea-test')
      const result: DirectoryEntry = fs._wrappedEntry as DirectoryEntry
      await cleanup(result)
      return fs
    } else {
      provider.authenticate()
    }
  },
  local: async () => {
    return await createNewLocal()
  }
}

export const canReadBasicStructure = async (
  entry: TransactionalDirectoryEntry
) => {
  const result: DirectoryEntry = entry._wrappedEntry as DirectoryEntry
  expect(result).to.be.an('object')

  const children = await result.getChildren()

  expect(children).to.be.an('array')

  expect(children.length).to.be.oneOf([5, 6])
}

export const canReadFile = async (entry: TransactionalDirectoryEntry) => {
  const result: DirectoryEntry = entry._wrappedEntry as DirectoryEntry
  const child = await getChild(result, 'test.md')
  expect(child).to.be.an('object')

  expect(child.isFile).to.be.true

  const file = await child.read()

  expect(file).to.be.instanceOf(File)

  expect(file.name).to.equal('test.md')

  expect(await file.content).to.equal('# Test Content')
}

export const canWriteFile = async (entry: TransactionalDirectoryEntry) => {
  const result: DirectoryEntry = entry._wrappedEntry as DirectoryEntry
  if (result.isReadonly) {
    console.warn('cant write to this filesystem because it is readonly')
    return
  }
  const NAME = 'test_file.txt'
  const CONTENT = 'test content'
  const folder = await getChild(result, 'docs')

  const f = new File([CONTENT], NAME)

  expect(folder).to.be.an('object')
  await folder.createFile(f)

  const createdEntry = await getChild(folder, NAME)

  console.log('children', await folder.getChildren())

  expect(createdEntry).to.be.an('object')

  expect(createdEntry.isFile).to.be.true

  const file = await createdEntry.read()

  expect(file).to.be.instanceOf(File)

  expect(file.name).to.equal(NAME)

  expect(await file.content).to.equal(CONTENT)

  await cleanup(result)
}

export const canUpdateContent = async (entry: TransactionalDirectoryEntry) => {
  const base: DirectoryEntry = entry._wrappedEntry as DirectoryEntry

  const file = (await getChild(
    entry,
    'test.md'
  )) as TransactionalWritableFileEntry

  let f = await file.read()

  try {
    expect(await f.content).to.equal('# Test Content')

    await file.updateContent('# New Content')

    f = await file.read()

    expect(await f.content).to.equal('# New Content')

    const baseEntry = (await getChild(base, 'test.md')) as WritableFileEntry

    let baseFile = await baseEntry.read()

    expect(await baseFile.content).to.equal('# Test Content')

    await file.saveContent()

    baseFile = await baseEntry.read()

    expect(await baseFile.content).to.equal('# New Content')

    await file.updateContent('# Test Content')

    await file.saveContent()
  } catch (e) {
    await file.updateContent('# Test Content')
    await file.saveContent()

    throw e
  }
}

export const canRename = async (entry: TransactionalDirectoryEntry) => {
  const base: DirectoryEntry = entry._wrappedEntry as DirectoryEntry

  const file = (await getChild(
    entry,
    'test.md'
  )) as TransactionalWritableFileEntry

  let f = await file.read()

  try {
    expect(f.name).to.equal('test.md')

    entry.rename('test2.md')

    f = await file.read()

    expect(f.name).to.equal('test2.md')

    let baseEntry = (await getChild(base, 'test.md')) as WritableFileEntry

    let baseFile = await baseEntry.read()

    expect(await baseFile.content).to.equal('# Test Content')

    await file.saveContent()

    baseEntry = (await getChild(base, 'test.md')) as WritableFileEntry

    expect(baseEntry).to.be.null

    baseEntry = (await getChild(base, 'test2.md')) as WritableFileEntry

    baseFile = await baseEntry.read()

    expect(await baseFile.content).to.equal('# Test Content')

    await baseEntry.write(new File(['# Test Content'], 'test.md'))
  } catch (e) {
    const baseEntry = (await getChild(base, 'test2.md')) as WritableFileEntry
    // await baseEntry.write(new File(['# Test Content'], 'test.md'))
    throw e
  }
}

export const canWatch = async (entry: TransactionalDirectoryEntry) => {
  const base: DirectoryEntry = entry._wrappedEntry as DirectoryEntry

  const file = (await getChild(
    entry,
    'test.md'
  )) as TransactionalWritableFileEntry

  let numberOfCalls = 0
  ;(await file.watchContent()).subscribe(() => numberOfCalls++)

  let numberOfCallsChildren = 0
  ;(await entry.watchChildren()).subscribe(() => numberOfCallsChildren++)

  expect(numberOfCalls).to.equal(1)
  expect(numberOfCallsChildren).to.equal(1)

  file.updateContent('djklf')

  expect(numberOfCalls).to.equal(2)
  file.updateContent('djklf')

  expect(numberOfCalls).to.equal(3)
  file.rename('djklf')

  expect(numberOfCalls).to.equal(3)
  expect(numberOfCallsChildren).to.equal(1)

  await file.rename('test2.md')

  expect(numberOfCalls).to.equal(3)
  expect(numberOfCallsChildren).to.equal(2)
}
