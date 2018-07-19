import markdownit from 'markdown-it'

export default md => {
  const config = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true
  }
  if (typeof md.extend === 'function') {
    md.extend(config)
  }
  const parser = markdownit(config)
  const plugins = md.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    Array.isArray(plugins[plugin])
      ? parser.use.apply(parser, plugins[plugin])
      : parser.use(plugins[plugin])
  })

  if (typeof md.customize === 'function') {
    md.customize(parser)
  }
  return parser
}
