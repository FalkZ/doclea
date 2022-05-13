<script lang="ts">
  export let inline = false
  export let className = []

  export let active = true

  className.push('Button')
</script>

<button on:click class:inline class={className.join(' ')} disabled={!active}
  ><slot /></button
>

<style>
  button {
    box-shadow: var(--ui-box-shadow);
    box-sizing: border-box;
    color: var(--ui-foreground-400);
    background-color: var(--ui-background-600);
    border: none;
    letter-spacing: 0.5px;
    border-radius: var(--ui-radius-400);
    padding: var(--ui-padding-400);
    display: block;
    margin: var(--ui-padding-400);
    font-weight: bold;
    cursor: pointer;
  }

  .inline {
    display: inline-block;
  }

  .small {
    display: inline-block;
    padding: var(--ui-padding-300);
    margin: 0;
    margin-left: var(--ui-padding-400);
  }
</style>
