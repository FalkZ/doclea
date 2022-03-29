import puppeteer from 'puppeteer'

import { createServer } from 'vite'

const startVite = async () => {
  const server = await createServer({
    configFile: 'vite.config.ts',
    root: '.',
    server: {
      port: 1337,
    },
  })
  await server.listen()

  server.printUrls()
}

// Shim for allowing async function creation via new Function
// eslint-disable-next-line
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

/**
 * @param fn see assertions at https://www.chaijs.com/api/assert/
 */
export const runInBrowser = async (
  fn: (assertions: Chai.ChaiStatic) => any,
  showBrowser?: boolean
) => {
  console.log(__dirname)
  await startVite()
  const browser = await puppeteer.launch({ headless: !showBrowser })
  const page = await browser.newPage()
  await page.goto('http://localhost:1337')
  page
    .on('console', (message) =>
      console.log(
        `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
      )
    )
    .on('pageerror', ({ message }) => console.log(message))

  const f = new AsyncFunction(`
  try {
    const __vite_ssr_dynamic_import__ = (i) => import(i);
    const assertions = await import('https://cdn.skypack.dev/chai@4.3.4');
    console.log(assertions);
    await Promise.resolve((${fn.toString()})(assertions.default))
  } catch (e) {
    return JSON.stringify(e)
  }
  `)

  await page.evaluate(f).then(async (a) => {
    if (a) throw JSON.parse(a)
  })

  await browser.close()
}
