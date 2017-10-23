// @flow

import markdownIt from 'markdown-it'
import markdownItAnchors from 'markdown-it-anchor'

/*
// here we optimize structure just a little to have to smallest json possible
const createElement = (component, props, children) => {
  return {
    t: component,
    ...(props && Object.keys(props).length ? { p: props } : {}),
    ...(children ? { c: children } : {})
  }
}
*/

const mdParser = ({ highlight, use }) => {
  const parser = markdownIt({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })

  // TODO: add anchorLevel support
  const plugins = [[markdownItAnchors, {}]].concat(use)

  plugins.forEach(plugin => {
    Array.isArray(plugin)
      ? parser.use.apply(parser, plugin)
      : parser.use(plugin)
  })

  return parser
}

export default (config: NuxtentConfig, rawBody: string): string => {
  /* const { dirName, section, fileName } = meta */
  const body = mdParser(config.parsersConfig.md).render(rawBody) // markdown to html
  return body
}
