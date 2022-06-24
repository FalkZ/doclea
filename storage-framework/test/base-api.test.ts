import { GithubFileSystem, LocalFileSystem, SolidFileSystem } from '../dist/esm'
import { expect } from 'browser-unit-test'
import type { StorageFrameworkFileEntry } from '../dist/types'
import type {
  DirectoryEntry,
  Entry
} from '../src/lib/new-interface/SFBaseEntry'

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
  // github: async () => {
  //   const provider = new GithubFileSystem({
  //     clientId: 'b0febf46067600eed6e5',
  //     clientSecret: '228480a8a7eae9aed8299126211402f47c488013'
  //   })

  //   if (await provider.isAuthenticated) {
  //     const fs = await provider.open('https://github.com/FalkZ/doclea-test')
  //     await cleanup(fs)
  //     return fs
  //   } else {
  //     provider.authenticate()
  //   }
  // },
  solid: async () => {
    const provider = new SolidFileSystem()

    if (await provider.isAuthenticated) {
      const fs = await provider.open('https://pod.inrupt.com/falkz/doclea-test')
      await cleanup(fs)
      return fs
    } else {
      provider.authenticate()
    }
  },
  local: async () => {
    return await createNewLocal()
  }
}

export const canReadBasicStructure = async (result: DirectoryEntry) => {
  expect(result).to.be.an('object')

  const children = await result.getChildren()

  expect(children).to.be.an('array')

  expect(children.length).to.be.oneOf([5, 6])
}

export const canReadFile = async (result: DirectoryEntry) => {
  const child = await getChild(result, 'test.md')
  expect(child).to.be.an('object')

  expect(child.isFile).to.be.true

  const file = await child.read()

  expect(file).to.be.instanceOf(File)

  expect(file.name).to.equal('test.md')

  expect(await file.content).to.equal('# Test Content')
}

export const canWriteFile = async (result: DirectoryEntry) => {
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
