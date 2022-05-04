<script lang="ts">
  import type { Message, MessageType } from './Messages'

  export let messages: Message[] = [
    { type: MessageType.Error, message: 'this is an error' },
    { type: MessageType.Warning, message: 'this is a warning' },
    { type: MessageType.Info, message: 'this is a info' },
    {
      type: MessageType.Prompt,
      message: 'this is prompt',
      actions: {
        a: () => console.log('clicked a'),
        b: () => console.log('clicked b'),
      },
    },
  ]
</script>

{#each messages as message}
  <div class={message.type}>{message.message}</div>
{/each}

<style>
  div.warn {
    background: var(--colors-warn);
  }
</style>
