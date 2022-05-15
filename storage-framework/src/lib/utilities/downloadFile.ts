export const downloadFile = (file: File): void => {
  const element = document.createElement('a')
  const url = URL.createObjectURL(file)
  element.setAttribute('href', url)
  element.setAttribute('download', file.name)
  //document.body.appendChild()
  element.click()
}
