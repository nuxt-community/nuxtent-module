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
  const anchorCallback = function(token, info) {
    page.toc = {
      tag: token.tag,
      slug: info.slug,
      title: info.title
    }
  }
  if (typeof toc === 'number') {
    md.plugins['toc'] = [
      require('markdown-it-anchor'),
      {
        level: toc,
        permalink: true,
        permalinkClass: 'nuxtent-toc',
        permalinkSymbol: '🔗',
        callback: anchorCallback
      }
    ]
  } else if (typeof toc === 'object') {
    md.plugins['toc'] = [
      require('markdown-it-anchor'),
      {
        ...toc,
        ...{ callback: anchorCallback }
      }
    ]
  }
  const parser = markdownit(config)
  const plugins = md.plugins || {}

  Object.keys(plugins).forEach(plugin => {
    Array.isArray(plugins[plugin])
      ? parser.use.apply(parser, plugins[plugin])
      : parser.use(plugins[plugin])
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
