import yamlit from 'js-yaml'
import markdownit from 'markdown-it'
import markdownAnchors from 'markdown-it-anchor'

export const mdParser = ({ highlight, use }, { anchorsLevel }) => {
  const parser = markdownit({
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
    highlight
  })

  const plugins = [
    [
      markdownAnchors,
      {
        level: [anchorsLevel]
      }
    ]
  ].concat(use)

  plugins.forEach(plugin => {
    Array.isArray(plugin)
      ? parser.use.apply(parser, plugin)
      : parser.use(plugin)
  })

  return parser
}

export const yamlParser = () => {
  return {
    render: yamlit.safeLoad
  }
}
