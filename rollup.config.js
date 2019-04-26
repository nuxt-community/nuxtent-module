import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import copy from 'rollup-plugin-copy'
// @ts-ignore
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
  json({
    preferConst: true
  }),
]

const bundle = (name, options) => ({
  input: `lib/${name}.ts`,
  output: [{
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
    plugins: [...corePlugins, copy({
      targets: {
        'lib/plugins/nuxtent-components.template.js': 'dist/plugins/nuxtent-components.template.js',
        'lib/plugins/nuxtent-config.template.js': 'dist/plugins/nuxtent-config.template.js'
      }
    })],
    external: [
      'path', 'fs',
      ...external
    ],
    globals: {
      process: {}
    }
  }),
  bundle('loader', {
    plugins: [...corePlugins],
    globals: {
      process: {}
    },
    external: ['path', 'fs', ...external]
  }),
  {
    input: 'lib/plugins/nuxtent-request.ts',
    plugins: [...corePlugins],
    output: [
      {
        file: `dist/plugins/nuxtent-request.js`,
        format: 'esm',
        exports: 'named',
        name: `nuxtent`,
        globals: {process: {}}
      }
    ],
    external: [...external, 'url', 'stream', 'http', 'https', 'zlib']
  },
  // bundle('plugins/nuxtent-request', {
  //   plugins: [...corePlugins],
  //   globals: {
  //     process: {}
  //   },
  //   external: ['path', 'fs', ...external]
  // })
]
