import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import copy from 'rollup-plugin-copy'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import pkg from './package.json'

const version = process.env.VERSION || pkg.version
const external = Object.keys(pkg.dependencies || {})

const banner = `/**
* Nuxtent v${version}
* (c) ${new Date().getFullYear()} Alid Castano
* @license MIT
*/
`

const corePlugins = [
  nodeResolve({
    preferBuiltins: true
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 10
          },
          debug: false
        }
      ]
    ]
  }),
  json(),
  filesize()
]

const bundle = (name, options) => ({
  input: `lib/${name}.js`,
  output: [
    {
      file: `dist/${name}.js`,
      format: 'cjs',
      exports: 'named',
      banner,
      name: `nuxtent`,
      globals: options.globals || {}
    },
    {
      file: `dist/${name}.mjs`,
      format: 'esm',
      exports: 'named',
      banner,
      name: `nuxtent`,
      globals: options.globals || {}
    }
  ],
  plugins: options.plugins || [...corePlugins],
  external: options.external || [...external]
})

export default [
  bundle('module', {
    plugins: [
      copy({
        'lib/plugins': 'dist/plugins'
      }),
      ...corePlugins
    ],
    external: [
      'path',
      'fs',
      'url',
      'querystring',
      'consola',
      'express',
      'axios',
      ...external
    ],
    globals: {
      process: {}
    }
  }),
  bundle('loader', {
    plugins: [...corePlugins],
    external: ['path', 'fs', 'axios', ...external]
  })
]
