export enum MessageType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Prompt = 'prompt',
  Query = 'query'
}

type Action = () => void

type Label = string

interface MessagePrompt {
  type: MessageType.Prompt
  message: string
  actions: Record<Label, Action>
}

interface BasicMessage {
  type: MessageType.Error | MessageType.Info | MessageType.Warning
  message: string
}

interface QueryMessage {
  type: MessageType.Query
  question: string
  placeholder: string
  validator?(value: string): boolean
  submit?(value: string): void
}

export type Message = BasicMessage | MessagePrompt | QueryMessage
