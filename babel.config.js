module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { modules: 'commonjs ', targets: { node: 10 }, debug: false }
    ]
  ],
  env: {
    test: {
      presets: [['@babel/preset-env', {
        loose: true
      }]]
    }
  },
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ],
  comments: false
}
