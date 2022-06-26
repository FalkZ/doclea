import { getFileContent } from './utilities/getFileContent'

/**
 * The representation of a file for the storage framework.
 */
export class SFFile extends File {
  public constructor(name: string, content: BlobPart[]) {
    super(content, name)
  }

  public get content(): Promise<string> {
    return getFileContent(this)
  }
}

export const duplicateFile = async (file: File): Promise<SFFile> => {
  const data = new Uint8Array(await file.arrayBuffer()).buffer
  return new SFFile(file.name, file.lastModified, [data])
}
