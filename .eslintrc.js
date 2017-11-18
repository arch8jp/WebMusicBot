module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
    'jquery': true,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module',
  },
  'rules': {
    "indent": [2, 2, {'SwitchCase': 1}],
    'linebreak-style': [2, 'windows'],
    'quotes': [2, 'single'],
    'semi': [2, 'never'],
    'no-console': 0,
    'comma-dangle': [2, 'always-multiline'],
    'eqeqeq': 2,
    'no-var': 2,
    'prefer-const': 2,
    'comma-style': [2, 'last'],
    'no-multiple-empty-lines': [1, { 'max': 1 }],
    'no-spaced-func': 2,
    'keyword-spacing': 2,
    'space-before-blocks': 2,
  },
}
