type Fn = () => void

export class Mutex {
  private queue: Fn[] = []
  private lock = false

  public apply<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        fn()
          .then((val) => resolve(val))
          .catch((val) => reject(val))
          .finally(() => {
            if (this.queue.length === 0) this.lock = false
            else this.queue.shift()()
          })
      }
      const queueWasEmpty = this.queue.length === 0
      this.queue.push(run)
      if (!this.lock) {
        this.lock = true
        this.queue.shift()()
      }
    })
  }
}
