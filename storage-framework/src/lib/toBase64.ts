export const toBase64 = (content: string | Buffer): string => {
  const val: Buffer =
    typeof content === 'string' ? Buffer.from(content, 'utf8') : content

  return val.toString('base64')
}
