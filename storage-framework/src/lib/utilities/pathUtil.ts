export class PathUtil {
  readonly path: string[]
  readonly fileName: string | undefined
  readonly isDirectory: boolean
  readonly isFile: boolean
  private readonly FILE_NAME_REGEX_P: RegExp = /[\w\s.,:_-]+\.[\w0-9]+/g
  private readonly PATH_SEPERATOR_REGEX_P: RegExp = /[\/\\]/g

  constructor(path: string) {
    this.path = path.split(this.PATH_SEPERATOR_REGEX_P)
    if (this.FILE_NAME_REGEX_P.test(this.path.slice(-1)[0])) {
      this.fileName = this.path.pop()
    }
    this.isFile = this.fileName ? true : false
    this.isDirectory = !this.isFile
  }
}
