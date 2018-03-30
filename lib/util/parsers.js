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
  if (typeof md.plugins === 'undefined') {
    md.plugins = []
  }
  const anchorCallback = function(token, info) {
    page.toc = {
      tag: token.tag,
      slug: info.slug,
      title: info.title
    }
  }
  if (typeof toc === 'number') {
    md.plugins.push([
      require('markdown-it-anchor'),
      {
        level: toc,
        permalink: true,
        permalinkClass: 'nuxtent-toc',
        permalinkSymbol: '🔗',
        callback: anchorCallback
      }
    ])
  } else if (typeof toc === 'object') {
    md.plugins.push([
      require('markdown-it-anchor'),
      {
        ...toc,
        ...{ callback: anchorCallback }
      }
    ])
  }

  const parser = markdownit(config)
  const plugins = md.plugins || {}

  plugins.forEach(plugin => {
    Array.isArray(plugin)
      ? parser.use.apply(parser, plugin)
      : parser.use(plugin)
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
