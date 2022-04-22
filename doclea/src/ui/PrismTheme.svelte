<script lang="ts">
  import { prefersDarkMode } from './prefersDarkMode'
  import dark from 'url:prism-themes/themes/prism-nord.css'
  import light from 'url:prism-themes/themes/prism-material-light.css'

  let theme = prefersDarkMode ? dark : light
</script>

<svelte:head>
  <link rel="stylesheet" href={theme} />
</svelte:head>
