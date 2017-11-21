import yamlit from 'js-yaml'
import markdownit from 'markdown-it'
import markdownAnchors from 'markdown-it-anchor'

export const mdParser = ({ config, postConstructionHook }, { anchorsLevel }) => {

  var baseConfig = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
  }

  for( var key in config ){
    baseConfig[key] = config[key]
  }

  const parser = markdownit(baseConfig)

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
