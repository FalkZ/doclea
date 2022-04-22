/// <reference types="svelte" />

declare module 'bundle-text:*' {
  const value: string
  export default value
}

declare module '*.md' {
  const content: string
  export default content
}

declare module 'url:*' {
  const url: string
  export default url
}
