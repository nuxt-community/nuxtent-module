module.exports = {
  'root': true,
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaVersion': 9,
    'sourceType': 'module'
  },
  'env': {
    'node': true,
    'es6': true,
    'jest': true
  },
  'plugins': [
    'unicorn'
  ],
  'extends': [
    'standard',
    'plugin:unicorn/recommended',
    'prettier/unicorn',
    'prettier/standard',
  ],
  'rules': {
    'curly': [
      'error',
      'all'
    ],
    'no-console': 1,
    'no-debugger': 1,
    'valid-jsdoc': ['error'],
    'space-before-function-paren': 0,
  },
  'globals': {
    'jest/globals': true,
    'jasmine': true
  }
}
