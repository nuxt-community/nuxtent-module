import yamlit from 'js-yaml'
import markdownit from 'markdown-it'

export const mdParser = ({ config, postConstructionHook }) => {

  const parser = markdownit(config)

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
