<script lang="ts">
  import Open from '@ui/views/Open.svelte'
  import Editor from '@ui/views/Editor.svelte'
  import Theming from '@ui/Theming.svelte'

  import type { StateMachine } from '../business-logic/state-machine/StateMachine'
  import type {
    AppStateMachine,
    Controller,
  } from '../business-logic/AppStateMachine'

  export let controller: Controller

  const { states } = controller.appStateMachine

  $: console.log($states)
</script>

<Theming />
{#if $states.name === 'selectingStorage'}
  <Open selectingStorageState={$states} />
{:else if $states.name === 'editing'}
  <Editor editingState={$states} />
{:else}
  Loading...
{/if}

<style>
  main {
    display: grid;
    /* grid-template-columns: minmax(150px, 300px) minmax(0, 1fr); */
    height: 100vh;
    width: 100vw;
  }
  :global(.icon-tabler) {
    height: 2em;
    margin-top: -0.5em;
    margin-bottom: -0.5em;
    position: relative;
    top: 0.1em;
  }
  #sidepane,
  #filetree {
    display: block;
    box-sizing: border-box;
    height: 100vh;
    background: var(--ui-background-500);
  }

  :global(html) {
    background-color: var(--ui-background-500) !important;
  }
  :global(.splitpanes) {
    background-color: var(--ui-background-500) !important;
  }
  :global(.splitpanes__splitter) {
    background-color: var(--ui-background-500) !important;
    border-color: var(--ui-background-500) !important;
    color: var(--ui-foreground-400) !important;
  }

  :global(.splitpanes__splitter::before, .splitpanes__splitter::after) {
    background-color: var(--ui-foreground-300) !important;
  }
</style>
