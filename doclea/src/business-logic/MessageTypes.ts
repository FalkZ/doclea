export enum MessageType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Prompt = 'prompt',
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

export type Message = BasicMessage | MessagePrompt
