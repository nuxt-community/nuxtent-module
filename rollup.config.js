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
    preferBuiltins: true
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  babel({
    babelrc: false,
    presets: [
      ['env', { modules: false, targets: { node: '8.11' } }],
      'stage-2'
    ],
    plugins: ['external-helpers']
  }),
  uglify(),
  filesize()
]

const bundle = (name, options) => ({
  input: `lib/${name}.js`,
  output: {
    file: `dist/${name}.js`,
    format: 'cjs',
    exports: 'named',
    banner: `
      /**
      * Nuxt Content v${version}
      * (c) ${new Date().getFullYear()} Alid Castano
      * @license MIT
      */
     `,
    name: `nuxtContent`,
    globals: options.globals || {}
  },
  plugins: options.plugins || [],
  external: options.external || []
})

export default [
  bundle('module', {
    plugins: [
      json(),
      copy({
        'lib/plugins': 'dist/plugins'
      }),
      ...corePlugins
    ],
    external: ['path', 'fs', 'querystring', 'express', 'axios', ...external],
    globals: {
      express: 'express',
      process: {}
    }
  }),
  bundle('loader', {
    plugins: [
      json(),
      resolve({
        preferBuiltins: true
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      babel({
        babelrc: false,
        presets: [
          ['env', { modules: false, targets: { node: '8.11' } }],
          'stage-2'
        ],
        plugins: ['external-helpers']
      }),
      filesize()
    ],
    external: ['path', 'fs', 'querystring', 'express', 'axios', ...external]
  })
]
