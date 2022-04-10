import { assert, describe, expect, it } from 'vitest'
import { LocalFileSystem } from '../../src/local-fs-adapter/LocalFileSystem'

// import wait from 'wait-for-sigint'
import { runInBrowser } from '../utils'

// https://www.chaijs.com/api/assert/
describe('LocalDirectoryEntry', () => {
  it('returns the children it contains', async () => {
    await runInBrowser(async ({ assert }) => {
      const { LocalDirectoryEntry } = await import(
        '../../src/local-fs-adapter/LocalDirectoryEntry'
      )
      let dirEntry = await new LocalFileSystem().open()
      let childs = await dirEntry.getChildren()
      assert(false, childs)

      console.log(LocalFileSystem)
      //throw new Error()
    }, true)
  })
})
