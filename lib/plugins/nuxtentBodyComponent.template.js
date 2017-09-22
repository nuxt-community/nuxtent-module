import Vue from 'vue'

const mdComps = {}

function importAllMdComps (r) {
  r.keys().forEach(key => (mdComps[key] = r(key)))
}

importAllMdComps(
  require.context(<%= JSON.stringify(options.srcDirFromPlugin) %>, true, /\.comp\.md$/)
)

Vue.component('nuxtent-body', {
  functional: true,
  props: {
    body: { required: true }
  },
  render (h, ctx) {
    const { body } = ctx.props
    if (typeof body === 'object') {
      const MarkdownComponent = mdComps[body.relativePath]
      return <MarkdownComponent />
    } else {
      return <div domPropsInnerHTML={body} />
    }
  }
})
