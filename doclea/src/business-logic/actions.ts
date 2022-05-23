import { createEventDispatcher } from 'svelte'

export enum ActionType {
  Save,
  OpenStorageSelection
}

export const dispatchAction = (type: ActionType, arg?: any): void => {
  const dispatch = createEventDispatcher()
  dispatch('action', {
    type,
    arg
  })
}

export interface ActionHandler {
  onAction(event: { detail: { type: ActionType; arg?: any } }): void
}
