module.exports = {
  extends: ['ijw'],
  plugins: ['only-warn'],
  rules: { 'import/no-absolute-path': 'off' },
  overrides: [
    {
      files: '**/*.svelte',

      rules: { 'import/first': 'off' }
    }
  ]
}
