import Vue from 'vue'

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
