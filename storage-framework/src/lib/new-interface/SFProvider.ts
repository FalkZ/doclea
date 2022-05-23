import type { SFError } from '../SFError'
import type { OkOrError, Result } from '../utilities'
import type { Entry } from './SFBaseEntry'

/**
 * Provider for the root entry of a file system.
 *
 * The provider takes care of any authentication implementations.
 */
export type SFProvider = SFProviderSimple | SFProviderAuth

interface SFProviderSimple {
  /**
   * Provide the root entry of a file system.
   *
   * @returns the root entry, or an error
   */
  open(): Result<Entry, SFError>
}

interface SFProviderAuth {
  /**
   * Provide the root entry of a file system.
   *
   * @returns the root entry, or an error
   */
  open(url: string): Result<Entry, SFError>
  authenticate(): OkOrError<SFError>
  isAuthenticated: Promise<boolean>
}
