/**
 * The error thrown by the storage framework
 */
export class SFError extends Error {
  private readonly reason
  constructor(message: string, reason?: Error) {
    super(message)
    this.reason = reason
  }
}
