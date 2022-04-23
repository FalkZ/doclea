module.exports = {
  extends: ['ijw'],
  rules: {
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
