/**
 * The error thrown by the storage framework
 */
export class SFError extends Error {
  private readonly reason?: Error | Error[]
  constructor(message: string, ...reasons: Error[]) {
    super(message)
    switch (reasons.length) {
      case 0:
        break
      case 1:
        this.reason = reasons[0]
        break
      default:
        this.reason = reasons
    }
  }
}
