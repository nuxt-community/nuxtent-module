import markdownit from 'markdown-it'

export default (md, page) => {
  const config = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true
  }
  if (md.extend !== undefined) {
    md.extend(config)
  }
  const parser = markdownit(config)
  const plugins = md.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    Array.isArray(plugins[plugin])
      ? parser.use.apply(parser, plugins[plugin])
      : parser.use(plugins[plugin])
  })

  if (md.customize !== undefined) {
    md.customize(parser)
  }
  return parser
}
