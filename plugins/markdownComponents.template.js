import Vue from 'vue'

// TODO: Hacer componentes de carga condicional, error, and loading
// TODO:Dar opción de configurar el timeout y delay


const NuxtentLoading = {
  name: 'nuxtent-loading',
  // functional: true,
  data() {
    return {
      loading: 'Loading...'
    }
  },
  render: function (createElement) {
    return createElement('div', this.loading)
  },
}
const NuxtentError = {
  name: 'nuxtent-loading',
  // functional: true,
  data() {
    return {
      msg: 'Error...'
    }
  },
  render: function (createElement) {
    return createElement('div', this.msg)
  },
}

const mdComps = <% options.components.forEach(([relativePath, filePath]) => {
print(`{'${relativePath}': () => ({
  component: import('${filePath}'),
  loading: NuxtentLoading,
  error: NuxtentError,
  asyncMeta: {}
  })}`)
}) %>

Vue.component('nuxtent-body', {
  // functional: true,
  // data: () => {},
  render (h) {
    const body = this.body || ''
    if (typeof body === 'object' && body.relativePath) {
      const MarkdownComponent = mdComps[body.relativePath]
      console.log(this)
      return h(<MarkdownComponent  {...{ domProps: {}, attrs: {}, listeners: {} }}></MarkdownComponent>)
    } else {
      const tag = this.tag
      return h(<tag {...{ domProps: {innerHTML: body}, attrs: {}, listeners: {} }}></tag>)
    }
  },
  // render (createElement, context) {
  //   const body = context.props.body || ''
  //   if (typeof body === 'object' && body.relativePath) {
  //     const MarkdownComponent = mdComps[body.relativePath]
  //     console.log(context)
  //     return createElement(MarkdownComponent, context.data)
  //   } else {
  //     return createElement('div', {...context.data, domProps: {innerHTML: body}})
  //   }
  // },
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
