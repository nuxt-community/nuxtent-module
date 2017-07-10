import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify-es'
import filesize from 'rollup-plugin-filesize'

const version = process.env.VERSION || require('./package.json').version

const corePlugins = () => [
  babel(),
  resolve(),
  commonjs(),
  builtins(),
  json(),
  filesize()
]

const bundle = (name, isModule = true) => ({
  entry: `lib/module.js`,
  dest: `dist/module.js`,
  format: 'umd',
  moduleName: `nuxtContent`,
  plugins: isModule ? corePlugins() : corePlugins().concat([uglify()]),
  external: [
    'express'
  ],
  banner: `
    /**
    * Nuxt Content v${version}
    * (c) ${new Date().getFullYear()} Alid Castano
    * @license MIT
    */
   `
})

export default [
  bundle('module'),
  bundle('plugin')
]
