/**
 * This function replaces the filename with a new file name. Through regex only the filename without the regex will be replaced.
 * @param fileName current filename
 * @param newName name of file to replace
 * @returns string new file name
 */
export function replaceFileNameWithNewName(
  fileName: string,
  newName: string
): string {
  /*
   * TODO: use /regex/ syntax for regexes
   * create a utility function in lib that can be used for github owner and repo fields
   */
  const match = fileName.match('/(.+?)(.[^.]*$|$)/')
  let firstMatch = ''
  if (match != null) {
    firstMatch = match[0]
  }
  return fileName.replace(firstMatch, newName)
}

/**
 * Extracts filename from url e.g from https://pod.inrupt.com/podname/bookmarks/test.jpg return value is test.jpg
 * @param url url as string
 * @returns filename from url as string
 */
export function getFileName(url: string): string {
  /*
   * TODO: use new Url()
   */
  let urltest = new URL(url)
  console.log(urltest)
  return url.match('/([^/]+)(?=[^/]*/?$)/')[0]
}
