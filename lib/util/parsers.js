const markdownit = require('markdown-it')
const yamlParser = require('js-yaml')

const mdParser = (highlight, plugins) => {
  const parser = markdownit({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })
  if (!plugins) return parser
  plugins.forEach(plugin => {
    Array.isArray(plugin) ? parser.use.apply(parser, plugin) : parser.use(plugin)
  })
  return parser
}

export default {
  md: mdParser,
  yaml: yamlParser.safeLoad
}
