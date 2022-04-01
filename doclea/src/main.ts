import App from './ui/App.svelte'
import 'storage-framework/src/dep'

const app = new App({
  target: document.getElementById('app')
})

export default app
