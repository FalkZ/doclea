import View from '@ui/View.svelte'

import { Controller } from './business-logic/AppStateMachine'

const controller = new Controller()

const view = new View({
  target: document.getElementById('app'),
  props: {
    controller
  }
})
export default view
