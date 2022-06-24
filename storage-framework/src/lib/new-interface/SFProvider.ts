import type { SFError } from '../SFError'
import type { OkOrError, Result } from '../utilities'
import type { TransactionalEntry } from './TransactionalEntry'

/**
 * Provider for the root entry of a file system.
 *
 * The provider takes care of any authentication implementations.
 */
export type SFProvider = SFProviderSimple | SFProviderAuth

export interface SFProviderSimple {
  /**
   * Provide the root entry of a file system.
   *
   * @returns the root entry, or an error
   */
  open(): Result<TransactionalEntry, SFError>
}

export interface SFProviderAuth {
  /**
   * Provide the root entry of a file system.
   *
   * @returns the root entry, or an error
   */
  open(url: string): Result<TransactionalEntry, SFError>
  authenticate(): OkOrError<SFError>
  isAuthenticated: Promise<boolean>
}
