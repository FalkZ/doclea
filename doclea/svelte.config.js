const sveltePreprocess = require('svelte-preprocess')
const config = {
  // options passed to svelte.compile
  // (https://svelte.dev/docs#compile-time-svelte-compile)
  compilerOptions: {},

  // preprocessors used with svelte.preprocess
  // (https://svelte.dev/docs#compile-time-svelte-preprocess)
  preprocess: [
    // sveltePreprocess is the default. It is automatically used, when the
    // dependency is resolvable, and when the `preprocess` property is not
    // defined in this configuration file, or when no configuration-file exists.
    sveltePreprocess(),
  ],
}
module.exports = { config }
