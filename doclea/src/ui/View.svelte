<script lang="ts">
  import StorageSelection from '@src/ui/views/StorageSelection.svelte'
  import Editor from '@ui/views/Editor.svelte'
  import Theming from '@ui/Theming.svelte'

  import type { Controller } from '@src/business-logic/Controller'
  import Messages from '@ui/components/prompt/Messages.svelte'

  export let controller: Controller
  const { messages } = controller

  const { states } = controller.appStateMachine

  $: console.log($states)
</script>

<Theming />
<Messages messages={$messages} />
{#if $states.name === 'selectingStorage'}
  <StorageSelection selectingStorageState={$states} />
{:else if $states.name === 'editing'}
  <Editor editingState={$states} />
{:else}
  Loading...
{/if}

<style>
  :global(.icon-tabler) {
    height: 2em;
    margin-top: -0.5em;
    margin-bottom: -0.5em;
    position: relative;
    top: 0.1em;
  }

  :global(html) {
    background-color: var(--ui-background-500) !important;
  }
</style>
