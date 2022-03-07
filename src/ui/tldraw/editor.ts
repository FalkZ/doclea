import * as React from 'react'
import { Tldraw, TldrawApp, TDShapeType, ColorStyle } from '@tldraw/tldraw'
import ReactDOM from 'react-dom'

declare const window: Window & { app: TldrawApp }

function Component({ resolveApi }) {
  const rTldrawApp = React.useRef<TldrawApp>()

  const handleMount = React.useCallback((app: TldrawApp) => {
    rTldrawApp.current = app

    resolveApi(app)
  }, [])

  return React.createElement(Tldraw, { onMount: handleMount }, null)
}

export function renderTLDrawToElement(
  element: HTMLElement
): Promise<TldrawApp> {
  let resolveApi: (api: TldrawApp) => void

  const api = new Promise<TldrawApp>((res) => {
    resolveApi = (api) => res(api)
  })
  ReactDOM.render(React.createElement(Component, { resolveApi }, null), element)

  return api
}
