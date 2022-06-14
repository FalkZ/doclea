import { GithubFileSystem } from '../src'

console.log('start tests')

const provider = new GithubFileSystem({
  clientId: 'b0febf46067600eed6e5',
  clientSecret: '228480a8a7eae9aed8299126211402f47c488013'
})

window.onclick = async () => {
  if (await provider.isSignedIn) {
    provider.open('https://github.com/FalkZ/doclea-test')
  } else {
    provider.authenticate()
  }
}
