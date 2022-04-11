import { assert, describe, expect, it, test } from 'vitest'
import { LocalFileSystem } from '../../src/local-fs-adapter/LocalFileSystem'

// import wait from 'wait-for-sigint'
import { runInBrowser } from '../utils'
import { select_option, time_ranges_to_array } from 'svelte/internal'

// https://www.chaijs.com/api/assert/
describe('LocalDirectoryEntry', () => {
  it('returns the children it contains', async () => {
    await runInBrowser(async ({ assert }) => {
      let root = document.getElementById('root')
      root.addEventListener('click', async (ev) => {
        let dirEntry = await new LocalFileSystem().open()
        let childs = await dirEntry.getChildren()
        assert(true, childs)
      })
      root.click()
      //throw new Error()
    }, true)
  })
})
