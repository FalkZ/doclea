export class Signal<T> extends Promise<T> {
  private res
  private rej

  constructor(fn?) {
    // needed for MyPromise.race/all ecc
    if (fn instanceof Function) {
      return super(fn)
    }

    let res
    let rej
    super((resolve, reject) => {
      res = (v) => resolve(v)
      rej = (e) => reject(e)
    })

    this.res = res
    this.rej = rej
  }
  public resolve(v: T): void {
    this.res(v)
  }

  public reject(e: Error): void {
    this.rej(e)
  }

  static get [Symbol.species]() {
    return Promise
  }
  get [Symbol.toStringTag]() {
    return 'Signal'
  }
}
