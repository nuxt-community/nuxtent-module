import yamlit from 'js-yaml'
import markdownit from 'markdown-it'
import markdownAnchors from 'markdown-it-anchor'

export const mdParser = ( md , { anchorsLevel }) => {

  var config = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true,
  }
  
  if (md.extend !== undefined ){
    md.extend(config)
  }

  const parser = markdownit(config)

  const plugins = [
    [
      markdownAnchors,
      {
        level: [anchorsLevel]
      }
    ]
  ].concat(md.plugins)

  plugins.forEach(plugin => {
    Array.isArray(plugin)
      ? parser.use.apply(parser, plugin)
      : parser.use(plugin)
  })

  if (md.customize !== undefined ){
    md.customize(parser)
  }

  return parser
}

export const yamlParser = () => {
  return {
    render: yamlit.safeLoad
  }
}
