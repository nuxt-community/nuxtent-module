import Vue from 'vue'

const mdComps = {}

function importAllMdComps (r) {
  r.keys().forEach(key => (mdComps[key] = r(key).default))
}

importAllMdComps(
  require.context(<%= JSON.stringify(options.contentDirWebpackAlias) %>, true, /\.comp\.md$/)
)

Vue.component('nuxtdown-body', {
  functional: true,
  render (createElement, context) {
    if (typeof context.props.body === 'object' && context.props.body.relativePath) {
      const MarkdownComponent = mdComps[context.props.body.relativePath]
      return createElement(MarkdownComponent, context.data)
    } else {
      return createElement('div', {...context.data, domProps: {innerHTML: context.props.body}})
    }
  },
  props: {
    body: {
      type: [Object, String]
    }
  }
});
