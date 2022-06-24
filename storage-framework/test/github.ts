import { GithubFileSystem } from '../dist/esm'
import { expect } from 'browser-unit-test'

const awaitClick = () =>
  new Promise<void>((resolve) => {
    const listener = () => {
      window.removeEventListener('click', listener)
      resolve()
    }
    window.addEventListener('click', listener)
  })

const cleanup = async (parent) => {
  getChild('', parent)
}

const getChild = async (key, parent) => {
  const children = await parent.getChildren()

  expect(children).to.be.an('array')

  return children.find(({ name }) => name === key)
}

export const provider = async () => {
  const provider = new GithubFileSystem({
    clientId: 'b0febf46067600eed6e5',
    clientSecret: '228480a8a7eae9aed8299126211402f47c488013'
  })

  if (await provider.isAuthenticated) {
    const result = await provider.open('https://github.com/FalkZ/doclea-test')

    console.log(result)
    expect(result).to.be.an('object')

    const children = await result.getChildren()

    expect(children).to.be.an('array')

    expect(children.length).to.equal(16)

    const folder = children.find(({ name }) => name === 'docs')

    // cleanup
    const c = await folder.getChildren()
    const fi = c.find(({ name }) => name === 'test_file.txt')

    if (fi) await fi.delete()

    const child = children.find(({ name }) => name === '.gitignore')
    expect(child).to.be.an('object')

    expect(child.isFile).to.be.true

    const file = await child.read()

    expect(file).to.be.instanceOf(File)

    expect(file.name).to.equal('.gitignore')

    expect(await file.content).to.equal(
      '# Logs\nlogs\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\nlerna-debug.log*\n\nnode_modules\ndist\ndist-ssr\n*.local\n\n# Editor directories and files\n.idea\n.DS_Store\n*.suo\n*.ntvs*\n*.njsproj\n*.sln\n*.sw?\n'
    )

    const f = new File(['test content'], 'test_file.txt')

    expect(folder).to.be.an('object')
    await folder.createFile(f)
  } else {
    provider.authenticate()
  }
}
