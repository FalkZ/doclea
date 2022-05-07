import App from './ui/App.svelte'

import './business-logic/StateMachineTest'
import './business-logic/AppStateMachine'

const app = new App({
  target: document.getElementById('app')
})
export default app
