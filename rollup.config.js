const resolve = require('rollup-plugin-node-resolve')
const builtins = require('rollup-plugin-node-builtins')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const uglify = require('rollup-plugin-uglify')
const filesize = require('rollup-plugin-filesize')
const version = process.env.VERSION || require('./package.json').version

module.exports = {
  entry: 'lib/test.js',
  dest: 'dist/build.js',
  format: 'umd',
  moduleName: 'nuxtContent',
  plugins: [
    resolve(),
    builtins(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    commonjs(),
    json(),
    uglify(),
    filesize()
  ],
  banner:
    `/**
      * Nuxt Content v${version}
      * (c) ${new Date().getFullYear()} Alid Castano
      * @license MIT
      */`
}
