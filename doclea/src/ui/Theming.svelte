<script lang="ts">
  import { prefersDarkMode } from './prefersDarkMode'
  import dark from 'prism-themes/themes/prism-nord.css?url'
  import light from 'prism-themes/themes/prism-material-light.css?url'

  const prismTheme = prefersDarkMode ? dark : light
</script>

<svelte:head>
  {#if prismTheme}
    <link rel="stylesheet" href={prismTheme} />
  {/if}
</svelte:head>
