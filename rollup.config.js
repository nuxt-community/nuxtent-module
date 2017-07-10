import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify-es'
import filesize from 'rollup-plugin-filesize'
import copy from 'rollup-plugin-copy'

const version = process.env.VERSION || require('./package.json').version

const corePlugins = () => [
  babel(),
  resolve(),
  commonjs(),
  builtins(),
  uglify(),
  filesize()
]

const bundle = (name, options) => ({
  entry: `lib/${name}.js`,
  dest: `dist/${name}.js`,
  format: 'umd',
  moduleName: `nuxtContent`,
  plugins: options.plugins || [],
  external: options.external || [],
  banner: `
    /**
    * Nuxt Content v${version}
    * (c) ${new Date().getFullYear()} Alid Castano
    * @license MIT
    */
   `
})

export default [
  bundle('module', {
    plugins: [
      ...corePlugins(),
      copy({ 'lib/plugin.js': 'dist/plugin.js' })
    ],
    external: [
      'express',
      'axios'
    ]
  })
]
