import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript'

import pkg from './package.json'

const version = process.env.VERSION || pkg.version
const external = Object.keys(pkg.dependencies || {})

const banner = `/**
* Nuxtent v${version}
* (c) ${new Date().getFullYear()} César Valadez
* @license MIT
*/
`

const corePlugins = [
  typescript(),
  nodeResolve({
    preferBuiltins: true
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  json(),
]

const bundle = (name, options) => ({
  input: `lib/${name}.ts`,
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
    plugins: [...corePlugins],
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
