<script lang="ts">
  import { MessageType, type Message } from './Messages'
  import info from 'tabler-icons-svelte/icons/InfoCircle'
  import warning from 'tabler-icons-svelte/icons/AlertTriangle'
  import error from 'tabler-icons-svelte/icons/AlertOctagon'
  import prompt from 'tabler-icons-svelte/icons/QuestionMark'
  import X from 'tabler-icons-svelte/icons/X'
  import Button from '../basic-elements/Button.svelte'

  export let messages: Message[] = [
    { type: MessageType.Error, message: 'this is an error' },
    { type: MessageType.Warning, message: 'this is a warning' },
    { type: MessageType.Info, message: 'this is a info' },
    {
      type: MessageType.Prompt,
      message: 'this is prompt',
      actions: {
        yes: () => console.log('clicked a'),
        no: () => console.log('clicked b'),
      },
    },
  ]

  const icons = { info, warning, error, prompt }
</script>

<div class="messages">
  {#each messages as message}
    <div class={'message ' + message.type}>
      <svelte:component this={icons[message.type]} />
      {message.message}
      {#if message.type === MessageType.Prompt}
        {#each Object.entries(message.actions) as [key, fn], i}
          <Button
            className={['inline', 'small', i === 0 ? 'primary' : '']}
            on:click={fn}>{key}</Button
          >
        {/each}
      {:else}
        <X />
      {/if}
    </div>
  {/each}
</div>

<style>
  .message {
    border-radius: var(--ui-radius-400);
    background-color: var(--ui-background-500);
    margin: var(--ui-padding-300);
    padding: var(--ui-padding-300);
    box-shadow: var(--ui-box-shadow);
    display: table;
    margin-left: auto;
    margin-right: 0;
    color: var(--ui-foreground-500);
    pointer-events: all;
  }
  div.warning {
    background-color: var(--ui-color-warn);
  }
  div.error {
    background-color: var(--ui-color-error);
  }
  div.info {
    background-color: var(--ui-color-info);
  }

  div.prompt {
    border: 1px solid var(--ui-border-400);
    background-color: var(--ui-background-500);
  }

  .prompt :global(.Button) {
    background-color: var(--ui-background-600);
    border: 1px solid var(--ui-border-400);
  }

  .prompt :global(.primary) {
    background-color: var(--ui-color-info);
    border: 1px solid var(--ui-color-info);
  }

  .messages {
    --ui-color-ok: #08a045;
    position: fixed;
    z-index: 10;
    text-align: right;
    width: 100%;
    padding: 0 var(--ui-padding-300);
    padding-right: var(--ui-padding-400);
    box-sizing: border-box;
    user-select: none;
    pointer-events: none;
    margin-top: 50px;
  }
</style>
