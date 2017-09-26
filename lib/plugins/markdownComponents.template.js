import Vue from 'vue'

const mdComps = {}

function importAllMdComps (r) {
  r.keys().forEach(key => (mdComps[key] = r(key).default))
}

importAllMdComps(
  require.context(<%= JSON.stringify(options.contentDirWebpackAlias) %>, true, /\.comp\.md$/)
)

Vue.component('nuxtent-body', {
  render () {
    if (typeof this.body === 'object' && this.body.relativePath) {
      const MarkdownComponent = mdComps[this.body.relativePath]
      return <MarkdownComponent />
    } else {
      return <div domPropsInnerHTML={ this.body } />
    }
  },
  props: {
    body: {
      type: [Object, String]
    }
  }
});
