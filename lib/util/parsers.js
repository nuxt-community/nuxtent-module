const yamlit = require('js-yaml')
const markdownit = require('markdown-it')
const markdownAnchors = require('markdown-it-anchor')

export const mdParser = ({ highlight, use }, { anchorsLevel }) => {
  const parser = markdownit({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })

  const plugins = [
    [markdownAnchors, { // TODO they are all getting IDs! :(
      level: anchorsLevel
    }]
  ].concat(use)

  plugins.forEach(plugin => {
    Array.isArray(plugin) ? parser.use.apply(parser, plugin) : parser.use(plugin)
  })

  return parser
}

export const yamlParser = () => {
  return {
      render: yamlit.safeLoad
  }
}
