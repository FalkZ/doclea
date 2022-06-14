<script lang="ts">
  import Milkdown from '@ui/components/Milkdown.svelte'

  import { Pane, Splitpanes } from 'svelte-splitpanes'

  import FileTree from '@ui/components/filetree/FileTree.svelte'

  import type { Editing } from '@src/business-logic/Editing'

  export let editingState: Editing

  const { selectedFile, files } = editingState
</script>

<main>
  <Splitpanes class="default-theme" style="height: 100%; width: 100vw">
    <Pane size="20">
      <FileTree
        entry={$files}
        on:close={(event) => editingState.closeEditor()}
        on:selected={(event) =>
          editingState.setSelectedEntry(event.detail.entry)}
      />
    </Pane>
    <Pane>
      <div class="milkdownContainer">
        {#if $selectedFile}
          <Milkdown selectedFile={$selectedFile} />
        {:else}
          select a file to start editing
        {/if}
      </div>
    </Pane>
  </Splitpanes>
</main>

<style>
  main {
    height: 100vh;
    width: 100vw;
  }
  .milkdownContainer {
    position: relative;
  }

  main :global(.splitpanes__pane) {
    min-width: 260px;
    background-color: var(--ui-background-500) !important;
  }

  main :global(.splitpanes) {
    background-color: var(--ui-background-500) !important;
  }
  main :global(.splitpanes__splitter) {
    background-color: var(--ui-background-500) !important;
    border-color: var(--ui-background-500) !important;
    color: var(--ui-foreground-400) !important;
  }

  main :global(.splitpanes__splitter::after),
  main :global(.splitpanes__splitter::before) {
    background-color: var(--ui-foreground-300) !important;
  }
</style>
