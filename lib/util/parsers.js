const yamlParser = require('js-yaml')
const markdownit = require('markdown-it')
const markdownAnchors = require('markdown-it-anchor')

const mdParser = ({ highlight, use, options }) => {
  const parser = markdownit({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })

  const plugins = [
    [markdownAnchors, options.anchors]
  ].concat(use)

  plugins.forEach(plugin => {
    Array.isArray(plugin) ? parser.use.apply(parser, plugin) : parser.use(plugin)
  })

  return parser
}

export default {
  md: mdParser,
  yaml: yamlParser.safeLoad
}
