import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify-es'
import filesize from 'rollup-plugin-filesize'
import copy from 'rollup-plugin-copy'

const version = process.env.VERSION || require('./package.json').version

const corePlugins = () => [
  resolve(),
  commonjs({
    include: 'node_modules/**'
  }),
  babel({
    plugins: ['external-helpers']
  }),
  builtins(),
  uglify(),
  filesize()
]

const bundle = (name, options) => ({
  input: `lib/${name}.js`,
  output: {
    file: `dist/${name}.js`,
    format: 'cjs',
    exports: 'named'
  },
  name: `nuxtContent`,
  plugins: options.plugins || [],
  external: options.external || [],
  globals: options.globals || {},
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
      json(),
      copy({
        'lib/plugins': 'dist/plugins',
        'lib/loader.js': 'dist/loader.js'
      }),
      ...corePlugins()
    ],
    external: [
      'express',
      'axios'
    ],
    globals: {
      express: 'express'
    }
  })
]
