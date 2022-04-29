<script lang="ts">
  import type { EditorState } from '../../editor-business-logic/EditorState'

  export let editorState: EditorState

  const keys = Object.keys(editorState)

  Object.keys($$slots).forEach((key) => {
    if (!keys.includes(key))
      console.warn(
        `"${key}"" does not exist in EditorState but was used as Router slot`
      )
  })
</script>

{#if editorState.openFile}
  <slot name="openFile" />
{/if}
{#if editorState.showEditor}
  <slot name="showEditor" />
{/if}
