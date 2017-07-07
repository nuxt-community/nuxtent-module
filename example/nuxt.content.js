module.exports = {
  data: {
    siteName: "Nuxt-Content"
  },
  dirs: [
    ["/", {
      isPost: false
    }],
    ["posts", {
      layout: "posts",
      route: "post",
      permalink: ":year/:slug",
      data: {
        category: "Posts"
      }
    }],
    ["projects", {
      layout: "projects",
      route: "projects-name",
      permalink: "projects/:slug",
      isPost: false
    }]
  ]
}
