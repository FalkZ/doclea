export class SFError extends Error {
  private reason
  constructor(message: string, reason: Error) {
    super(message)
    this.reason = reason
  }
}
