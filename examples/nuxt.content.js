module.exports = {
  srcDir: '/content',
  data: {
    siteName: "Nuxt-Content"
  },
  dirs: [
    ["posts", {
      routeName: "post",
      permalink: ":year/:slug",
      data: {
        category: "Posts"
      }
    }],
    ["projects", {
      routeName: "projects-name",
      permalink: "projects/:slug",
      componentDir: "components",
      isPost: false
    }]
  ]
}
