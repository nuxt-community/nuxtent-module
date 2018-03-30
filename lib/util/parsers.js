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
    let addToToc = true
    if (typeof token.attrs !== 'undefined') {
      Object.keys(token.attrs).forEach(attr => {
        const value = token.attrs[attr][1]
        const key = token.attrs[attr][0]
        // FIXME: Match notoc with regex in case there's other classes
        if (key === 'class' && value === 'notoc') {
          addToToc = false
        }
      })
    }
    if (addToToc) {
      page.toc = {
        tag: token.tag,
        slug: info.slug,
        title: info.title
      }
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
