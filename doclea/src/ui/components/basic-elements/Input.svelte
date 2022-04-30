<script lang="ts">
  export let value = ''
  export let placeholder
</script>

<input type="text" on:change {placeholder} bind:value />

<style>
  input {
    box-shadow: var(--ui-box-shadow-inset);
    box-sizing: border-box;
    color: var(--ui-foreground-400);
    background-color: var(--ui-background-600);
    border: none;
    letter-spacing: 0.5px;
    border-radius: var(--ui-radius-400);
    padding: var(--ui-padding-400);
    display: block;
    margin: 1em;
    /* font-weight: bold; */
    width: calc(100% - 2 * var(--ui-padding-400));
  }
</style>
