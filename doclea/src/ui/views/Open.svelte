<script lang="ts">
  import svg from '/assets/favicon.svg?raw'
  import Button from '@ui/components/basic-elements/Button.svelte'
  import Input from '@ui/components/basic-elements/Input.svelte'
  import Folder from 'tabler-icons-svelte/icons/Folder.svelte'
  import BrandGithub from 'tabler-icons-svelte/icons/BrandGithub.svelte'
  import Hexagon from 'tabler-icons-svelte/icons/Hexagon'
  import X from 'tabler-icons-svelte/icons/X.svelte'
  import type { SelectingStorage } from 'src/business-logic/SelectingStorage'

  export let selectingStorageState: SelectingStorage

  const { isOpenButtonActive } = selectingStorageState

  let value
</script>

<div class="backdrop" />
<div class="plane">
  <div class="close"><X /></div>

  <h1>{@html svg}oclea</h1>
  <p>select a storage location</p>
  <div>
    <Input placeholder="https://github.com/..." bind:value />

    <p>
      <Button
        inline={true}
        on:click={() => selectingStorageState.openSolid(value)}
        active={$isOpenButtonActive}
        className={['left']}><Hexagon /> Solid</Button
      >
      or
      <Button
        inline={true}
        on:click={() => selectingStorageState.openGithub(value)}
        className={['right']}><BrandGithub /> GitHub</Button
      >
    </p>
  </div>
  <hr />

  <Button
    inline={true}
    on:click={() => selectingStorageState.openLocal()}
    active={$isOpenButtonActive}><Folder /> open local folder</Button
  >
</div>

<style>
  h1 {
    font-size: 80px;
    margin: 0;
  }

  p {
    position: relative;
    display: block;
  }

  /* div :global(.left) {
    position: absolute;
    top: -20px;
    left: 0;
  }

  div :global(.right) {
    position: absolute;
    top: -20px;
    right: 0;
  } */

  :global(.logo) {
    height: 1em;
    width: 1em;
    top: 0.1em;
    position: relative;
    margin-right: -0.2em;
  }
  .close {
    position: absolute;
    right: var(--ui-padding-500);
    display: table;
  }

  .backdrop {
    z-index: 9;
    position: fixed;
    width: 100vw;
    height: 100vh;
    /* opacity: 0.1; */
    /* background: rgba(255, 255, 255); */
    backdrop-filter: blur(10px);
  }
  .plane {
    text-align: center;
    z-index: 10;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--ui-background-500);
    box-shadow: var(--ui-box-shadow);
    padding: var(--ui-padding-500);
    border-radius: var(--ui-radius-400);
    box-sizing: border-box;
    width: 600px;
    max-width: 100vw;
  }

  hr {
    outline: none;
    border: none;
    border-top: 1px solid var(--ui-border-400);
  }
</style>
