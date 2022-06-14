import { nanoid } from 'nanoid'

export const value =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KICAgICAgPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGRhdGEtdGxkcmF3PSJleUpwWkNJNkltUnZZeUlzSW01aGJXVWlPaUpPWlhjZ1JHOWpkVzFsYm5RaUxDSjJaWEp6YVc5dUlqb3hOUzR6TENKd1lXZGxjeUk2ZXlKd1lXZGxJanA3SW1sa0lqb2ljR0ZuWlNJc0ltNWhiV1VpT2lKUVlXZGxJREVpTENKamFHbHNaRWx1WkdWNElqb3hMQ0p6YUdGd1pYTWlPbnQ5TENKaWFXNWthVzVuY3lJNmUzMTlmU3dpY0dGblpWTjBZWFJsY3lJNmV5SndZV2RsSWpwN0ltbGtJam9pY0dGblpTSXNJbk5sYkdWamRHVmtTV1J6SWpwYlhTd2lZMkZ0WlhKaElqcDdJbkJ2YVc1MElqcGJNQ3d3WFN3aWVtOXZiU0k2TVgwc0ltVmthWFJwYm1kSlpDSTZiblZzYkgxOUxDSmhjM05sZEhNaU9udDlmUT09IiB2aWV3Qm94PSItNDAwIC0zMDAgODAwIDYwMCI+Cjwvc3ZnPg=='

export const tldrawDefaultNode = () => ({
  type: 'tldraw',
  attrs: {
    value,
    identity: nanoid(),
    create: true
  },
  content: [
    {
      type: 'text',
      text: value
    }
  ]
})

export const text = `![TLDraw Drawing](${value})`
