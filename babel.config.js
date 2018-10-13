module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { modules: 'commonjs ', targets: { node: 10 }, debug: false }
    ]
  ],
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  comments: false
}
