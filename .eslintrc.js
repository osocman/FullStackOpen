module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': 0,
    'no-underscore-dangle': 0,
    eqeqeq: 'error',
    'no-console': 'off',
    'no-unused-vars': 'off',
  },
};
