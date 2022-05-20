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
      <div>
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
  div {
    position: relative;
  }
  #te {
    display: table;
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
  #filetree {
    overflow: scroll;
  }

  :global(html) {
    background-color: var(--ui-background-500) !important;
  }

  :global(.splitpanes__pane) {
    min-width: 220px;
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
