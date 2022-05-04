import { StateMachine } from './State'

const test = new StateMachine({
  init: ({ authenticate }) => {
    // wait for button
    return authenticate
  },
  error: ({ init }) => {
    // show message
    return init
  },
  authenticate: ({ open, error }) => {
    if (Math.random() > 0.5) return error

    return open
  },
  open: ({ end, error }) => {
    const err = false
    if (err) return error

    return end
  }
})

test.run()
