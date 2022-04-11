module.exports = {
  env: {
    es6: true,
    browser: true
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['svelte3', '@typescript-eslint', 'prefer-arrow-functions'],

  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./*/tsconfig.json'],
    extraFileExtensions: ['.svelte']
  },
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  rules: {
    'prefer-arrow-callback': 'warn',
    'prefer-arrow-functions/prefer-arrow-functions': [
      'warn',
      {
        classPropertiesAllowed: false,
        disallowPrototype: false,
        returnStyle: 'implicit',
        singleReturnOnly: false
      }
    ],
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ExportDefaultDeclaration',
        message: 'Prefer named exports'
      }
    ],
    curly: ['warn', 'multi-or-nest', 'consistent'],
    quotes: ['warn', 'single'],
    'no-invalid-this': 'error',
    'no-empty': 'warn',
    'no-constant-condition': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    eqeqeq: 'error'
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  settings: {
    'svelte3/typescript': true
  }
}
