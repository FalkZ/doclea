import { StateMachine, type DefinableStates } from './State'
import { StorageSelectionState } from './StorageSelection'

const stateMachineSkeleton: DefinableStates = {
  init: ({ storageSelectionState }) => {
    return storageSelectionState
  },
  storageSelectionState: new StorageSelectionState()
}

export type BusinessLogicStateMachine = typeof stateMachineSkeleton

export const businessLogic = new StateMachine(stateMachineSkeleton)
