/**
 * The representation of a file for the storage framework.
 */
export class SFFile extends File {
  constructor(name: string, lastModified: number, content: BlobPart[]) {
    super(content, name, { lastModified })
  }
}
