import yamlit from 'js-yaml'
import markdownit from 'markdown-it'

export const mdParser = (md, { toc }, page) => {
  const config = {
    preset: 'default',
    html: true,
    typographer: true,
    linkify: true
  }

  if (md.extend !== undefined) {
    md.extend(config)
  }

  if (typeof console.plugins === 'undefined') {
    md.plugins = {}
  }

  if (typeof toc === 'number') {
    md.plugins['markdown-it-anchor'] = {
      level: toc,
      permalink: true,
      permalinkClass: 'nuxtent-toc',
      permalinkSymbol: '🔗',
      callback: function(Atoken, Ainfo) {
        page.toc = { Btoken: Atoken, Binfo: Ainfo }
      }
    }
  } else if (typeof toc === 'object') {
    md.plugins['markdown-it-anchor'] = toc
  }

  const parser = markdownit(config)
  const plugins = md.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    parser.use(require(plugin), plugins[plugin])
  })

  if (md.customize !== undefined) {
    md.customize(parser)
  }
  return parser
}

export const yamlParser = () => {
  return {
    render: yamlit.safeLoad
  }
}
