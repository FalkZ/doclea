module.exports = {
  extends: ['ijw'],
  rules: {
    '@typescript-eslint/method-signature-style': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/method-signature-style': ['error', 'method'],
    'no-new': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase']
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE']
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow'
      },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase']
      },
      {
        selector: 'typeLike',
        format: ['PascalCase']
      },
      {
        selector: 'enumMember',
        format: ['PascalCase']
      }
    ]
  }
}
