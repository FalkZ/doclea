<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte'

  import type {
    StorageFrameworkDirectoryEntry,
    StorageFrameworkEntry,
  } from 'storage-framework/src/lib/StorageFrameworkEntry'
  import type { SelectedEventDetail } from './SelectedEventDetail'
  import ChevronRight from 'tabler-icons-svelte/icons/ChevronRight'
  import File from 'tabler-icons-svelte/icons/File'
  import type { Readable, Writable } from 'svelte/store'

  const dispatch = createEventDispatcher()

  export let entry: StorageFrameworkEntry
  export let showAsRootNode: boolean = false
  export let indentionLevel = 0

  const getIndentationLevelStyle = (indentionLevel: number) =>
    `--indention-level: calc(${indentionLevel} * var(--ui-padding-500))`

  let isSelected = false
  let showChildren = indentionLevel === 0
  let children: StorageFrameworkEntry[] = []

  $: {
    if (entry.isDirectory) {
      const dirEntry: StorageFrameworkDirectoryEntry = <
        StorageFrameworkDirectoryEntry
      >entry
      dirEntry.getChildren().then((childs) => {
        children = childs
      })
      dirEntry.watchChildren().then((observable) => {
        observable.subscribe((childs) => {
          children = childs
        })
      })
    }
  }

  const onSelectClick = (event: Event) => {
    event.stopPropagation()

    isSelected = true
    const detail: SelectedEventDetail = {
      entry: entry,
      onDeselect: () => {
        isSelected = false
      },
    }
    dispatch('selected', detail)
  }

  const onContextMenu = (event: Event) => {
    event.stopPropagation()

    // TODO: context menu
    if (entry.isDirectory)
      (<StorageFrameworkDirectoryEntry>entry).createFile('test')
  }

  const onArrowClicked = (event: Event) => {
    event.stopPropagation()
    if (!showAsRootNode) showChildren = !showChildren
  }

  const entryOnRenaming: Writable<StorageFrameworkEntry> =
    getContext('renameStore')

  // entryOnRenaming.subscribe(() => {
  //   if (i) i.focus()
  // })

  let i

  const cb = (target) => {
    console.log('changed rename')
    setTimeout(() => target.focus())
  }

  // const { wasModified } = entry
</script>

{#if entry.isFile}
  <div
    class="entry title {isSelected ? 'selected' : ''}"
    style={getIndentationLevelStyle(indentionLevel)}
    on:click={onSelectClick}
    on:dblclick={(e) => {
      $entryOnRenaming = entry
    }}
  >
    <File />
    {#if true}
      <span>
        {entry.name}
      </span>
    {:else}
      <input
        use:cb
        bind:this={i}
        on:change={(event) => entry.rename(event.target.value)}
        on:blur={(e) => {
          $entryOnRenaming = null
        }}
        type="text"
        value={entry.name}
      />
    {/if}
    <!-- {#if $wasModified}
      <span class="mod">•</span>
    {/if} -->
  </div>
{:else}
  <div
    class="entry {isSelected ? 'selected' : ''}"
    on:click={onSelectClick}
    on:contextmenu|preventDefault={onContextMenu}
  >
    {#if showAsRootNode}
      <div class:root={showAsRootNode}>
        <b class="" style={getIndentationLevelStyle(indentionLevel)}
          >{entry.fullPath}</b
        >
      </div>
    {:else}
      <div
        class="title"
        style={getIndentationLevelStyle(indentionLevel)}
        on:dblclick={(e) => {
          $entryOnRenaming = entry
        }}
      >
        <span
          on:click={onArrowClicked}
          on:contextmenu|preventDefault={onContextMenu}
          class="arrow"
          class:arrowDown={showChildren}><ChevronRight /></span
        >

        {#if $entryOnRenaming !== entry}
          <span>
            {entry.name}
          </span>
        {:else}
          <input
            use:cb
            bind:this={i}
            on:change={(event) => entry.rename(event.target.value)}
            on:blur={(e) => {
              $entryOnRenaming = null
            }}
            type="text"
            value={entry.name}
          />
        {/if}
      </div>
    {/if}
    {#if showChildren}
      <div>
        {#each children as child}
          <svelte:self
            entry={child}
            indentionLevel={indentionLevel + 1}
            on:selected
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .root {
    padding: var(--ui-padding-400);
    font-weight: bold;
    /* background-color: rgba(0.7, 0.7, 0.7, 0.4); */
  }

  .mod {
    color: var(--ui-color-primary);
  }

  .entry {
    cursor: pointer;
    font-weight: bold;
    white-space: nowrap;
  }

  .selected {
    background-color: var(--ui-background-600);
  }

  .title {
    user-select: none;
    padding: var(--ui-padding-300);
    padding-left: var(--indention-level);
  }

  .title:hover {
    background-color: var(--ui-background-400);
  }

  .arrow {
    display: inline-block;
  }

  .arrowDown {
    transform: rotate(90deg);
  }

  input {
    font: inherit;
    border: none;
    background: none;
    outline: none;
    padding: 0;
  }
</style>
