import yamlit from 'js-yaml'
import markdownit from 'markdown-it'
import markdownAnchors from 'markdown-it-anchor'

export const mdParser = ({ highlight, use, rules }, { anchorsLevel }) => {
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

  for (var key in rules){
    parser.renderer.rules[key] = rules[key]
  }

  return parser
}

export const yamlParser = () => {
  return {
    render: yamlit.safeLoad
  }
}
