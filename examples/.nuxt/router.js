'use strict'

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


const _2cc8d6c6 = () => import('/Users/acastano/Sites/nuxt/nuxt-content/examples/pages/index.vue' /* webpackChunkName: "pages/index" */)

const _8596f37c = () => import('/Users/acastano/Sites/nuxt/nuxt-content/examples/pages/projects/index.vue' /* webpackChunkName: "pages/projects" */)

const _607084da = () => import('/Users/acastano/Sites/nuxt/nuxt-content/examples/pages/projects/_name.vue' /* webpackChunkName: "pages/projects-name" */)

const _4c419eca = () => import('/Users/acastano/Sites/nuxt/nuxt-content/examples/pages/_post.vue' /* webpackChunkName: "pages/post" */)



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
			component: _2cc8d6c6,
			name: "index"
		},
		{
			path: "/projects",
			component: _8596f37c,
			name: "projects"
		},
		{
			path: "/projects/:slug",
			component: _607084da,
			name: "projects-name"
		},
		{
			path: "/:year/:slug",
			component: _4c419eca,
			name: "post"
		}
    ]
  })
}
