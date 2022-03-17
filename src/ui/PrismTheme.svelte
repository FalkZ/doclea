<script lang="ts">
  import { prefersDarkMode } from './prefersDarkMode'
  import dark from 'prism-themes/themes/prism-nord.css?url'
  import light from 'prism-themes/themes/prism-material-light.css?url'

  let theme = prefersDarkMode ? dark : light

  theme = theme.replace('export default "', '').replace('"', '')
</script>

<svelte:head>
  <link rel="stylesheet" href={theme} />
</svelte:head>
