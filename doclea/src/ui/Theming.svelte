<script lang="ts">
  import { prefersDarkMode } from './prefersDarkMode'
  import dark from 'url:prism-themes/themes/prism-nord.css'
  import light from 'url:prism-themes/themes/prism-material-light.css'

  const prismTheme = prefersDarkMode ? dark : light
</script>

<svelte:head>
  {#if prismTheme}
    <link rel="stylesheet" href={prismTheme} />
  {/if}
</svelte:head>
