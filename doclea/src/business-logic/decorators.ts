import { Editing } from './Editing'
import { ActionType } from './actions'

/**
 * Decorator that calls onError on the class used if an error is thrown
 * @param message error message
 */
export const ErrorMessage = (message: string) => (value, key, descriptor) => {
  const val = descriptor.value
  descriptor.value = async function (...all) {
    try {
      await val(...all)
    } catch (e) {
      console.error(e)
      this.onError(message, e)
    }
  }
}
export const AddActionListener =
  (actionType: ActionType) => (prototype: Editing, key) => {
    prototype.constructor.addActionListener(actionType, key)
  }
