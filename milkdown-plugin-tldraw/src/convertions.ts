export const toImageURL = (svg) => 'data:image/svg+xml;base64,' + btoa(svg)
export const serializeDocument = (doc: Object) => btoa(JSON.stringify(doc))

export function dataURLtoFile(dataUrl, fileName) {
  var arr = dataUrl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], fileName, { type: mime })
}
