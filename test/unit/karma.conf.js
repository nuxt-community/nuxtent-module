module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],

    files: ['./specs/**.spec.js'],

    preprocessors: {
      '../../lib/module.js': ['rollup'],
      '../../lib/content/**.js': ['rollup'],
      './specs/**.spec.js': ['rollup']
    },

    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-babel')(),
        require('rollup-plugin-commonjs')()
      ],
      format: 'umd',
      moduleName: `nuxtContent`,
      sourceMap: 'inline'
    }
  })
}
