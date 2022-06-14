const fileReader = new FileReader()

export const getFileContent = (file: File): Promise<string> =>
  new Promise((resolve) => {
    fileReader.onload = () => resolve(fileReader.result)

    fileReader.readAsText(file)
  })
