export class SFFile extends File {
  constructor(name: string, lastModified: number, content: BlobPart[]) {
    super(content, name, { lastModified })
  }
}
