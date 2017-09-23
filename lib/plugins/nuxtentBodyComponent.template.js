import Vue from 'vue'

const mdComps = {}

function importAllMdComps (r) {
  r.keys().forEach(key => (mdComps[key] = r(key).default))
}

importAllMdComps(
  require.context(<%= JSON.stringify(options.srcDirFromPlugin) %>, true, /\.comp\.md$/)
)

Vue.component('nuxtent-body', {
  render: function(h) {
    if (typeof this.body === 'object' && this.body.relativePath) {
      const MarkdownComponent = mdComps[this.body.relativePath]
      return h(MarkdownComponent)
    } else {
      return h('div', {
        domProps: {
          innerHTML: this.body
        }
      });
    }
  },
  props: {
    body: {
      type: [Object, String]
    }
  }
});
