'use strict'

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


const _09b4c6c1 = () => import('/Users/acastano/Sites/nuxt/nuxtent/examples/markdown-components/pages/index.vue' /* webpackChunkName: "pages/index" */)

const _07fe2579 = () => import('/Users/acastano/Sites/nuxt/nuxtent/examples/markdown-components/pages/_slug.vue' /* webpackChunkName: "pages/slug" */)



const scrollBehavior = (to, from, savedPosition) => {
  // savedPosition is only available for popstate navigations.
  if (savedPosition) {
    return savedPosition
  } else {
    let position = {}
    // if no children detected
    if (to.matched.length < 2) {
      // scroll to the top of the page
      position = { x: 0, y: 0 }
    }
    else if (to.matched.some((r) => r.components.default.options.scrollToTop)) {
      // if one of the children has scrollToTop option set to true
      position = { x: 0, y: 0 }
    }
    // if link has anchor,  scroll to anchor by returning the selector
    if (to.hash) {
      position = { selector: to.hash }
    }
    return position
  }
}


export function createRouter () {
  return new Router({
    mode: 'history',
    base: '/',
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    scrollBehavior,
    routes: [
  		{
			path: "/",
			component: _09b4c6c1,
			name: "index"
		},
		{
			path: "/:slug",
			component: _07fe2579,
			name: "slug"
		}
    ]
  })
}
