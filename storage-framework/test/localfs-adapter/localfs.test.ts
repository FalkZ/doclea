import { assert, describe, expect, it } from 'vitest'

// import wait from 'wait-for-sigint'
import { runInBrowser } from '../utils'

// https://www.chaijs.com/api/assert/
describe('localfs', () => {
  it('foo', async () => {
    await runInBrowser(async ({ assert }) => {
      //assert(false, 'worked assert')
      const { LocalFileSystem } = await import(
        '@src/localfs-adapter/LocalFilesystem'
      )

      assert(false, 'bla bla')

      console.log(LocalFileSystem)
      //throw new Error()
    }, true)
  })
})
