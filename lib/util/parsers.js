import yamlit from 'js-yaml'
import markdownit from 'markdown-it'
import markdownAnchors from 'markdown-it-anchor'

export const mdParser = ({ configureHook, postConstructionHook }, { anchorsLevel }) => {

  var config = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
  }
  
  if (configureHook !== undefined ){
    configureHook(config)
  }

  const parser = markdownit(config)

  const plugins = [
    [
      markdownAnchors,
      {
        level: [anchorsLevel]
      }
    ]
  ]

  plugins.forEach(plugin => {
    Array.isArray(plugin)
      ? parser.use.apply(parser, plugin)
      : parser.use(plugin)
  })

  if (postConstructionHook !== undefined ){
    postConstructionHook(parser)
  }

  return parser
}

export const yamlParser = () => {
  return {
    render: yamlit.safeLoad
  }
}
