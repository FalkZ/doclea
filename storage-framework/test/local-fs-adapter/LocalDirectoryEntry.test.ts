import { assert, describe, expect, it, test } from 'vitest'
import { LocalFileSystem } from '../../src/local-fs-adapter/LocalFileSystem'

// import wait from 'wait-for-sigint'
import { runInBrowser } from '../utils'

// https://www.chaijs.com/api/assert/
describe('LocalDirectoryEntry', () => {
  it('returns the children it contains', async () => {
    await runInBrowser(async ({ assert }) => {
      let dirEntry = await new LocalFileSystem().open()
      let childs = await dirEntry.getChildren()
      assert(false, childs)
      //throw new Error()
    }, true)
  })
})
