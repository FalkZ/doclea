import View from './ui/View.svelte'

//import './business-logic/StateMachineTest'
import { AppStateMachine, Controller } from './business-logic/AppStateMachine'
import type { StateMachine } from './business-logic/state-machine/StateMachine'

const controller = new Controller()

const view = new View({
  target: document.getElementById('app'),
  props: {
    controller
  }
})
export default view
