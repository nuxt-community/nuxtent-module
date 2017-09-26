import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify-es'
import filesize from 'rollup-plugin-filesize'
import copy from 'rollup-plugin-copy'

import pkg from './package.json'

const version = process.env.VERSION || pkg.version
const external = Object.keys(pkg.dependencies || {})

const corePlugins = [
  resolve({
    preferBuiltins: false
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  babel({
    babelrc: false,
    presets: [['es2015', { modules: false }], 'stage-2'],
    plugins: [
      'transform-async-to-generator',
      [
        'transform-object-rest-spread',
        {
          useBuiltIns: true
        }
      ],
      'external-helpers'
    ]
  }),
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
      ...corePlugins
    ],
    external: ['path', 'fs', 'querystring', 'express', 'axios', ...external],
    globals: {
      express: 'express'
    }
  })
]
