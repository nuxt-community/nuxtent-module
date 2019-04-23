import Vue from 'vue'

import { interopDefault } from './utils'

const mdComps = {<% options.components.forEach(([relativePath, filePath]) => {
  print(`
    '${relativePath}': () => interopDefault(import('${filePath}')),`
  )})
%>}


Vue.component('nuxtent-body', {
  name: 'NuxtentBody',
  render (createElement) {
    const body = this.body || ''
    const tag = this.tag

    const dataObject = {
      props: {tag},
      on: this.$listeners,
      domProps: {},
    }
    if (typeof body === 'object') {
      if (body.relativePath) {
        const MarkdownComponent = mdComps[body.relativePath]
        dataObject.nativeOn = this.$listeners
        return createElement(MarkdownComponent, dataObject)
      }
      dataObject.domProps.innerHTML = JSON.stringify(body)
      return createElement(tag, dataObject)
    } else {
      dataObject.domProps.innerHTML = body
      return createElement(tag, dataObject)
    }
  },
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    body: {
      type: [Object, String],
      required: true
    }
  }
});
