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
      route: "/",
      permalink: ":year/:slug",
      data: {
        category: "Posts"
      }
    }],
    ["projects", {
      layout: "projects",
      route: "projects",
      permalink: ":section/:slug",
      isPost: false
    }]
  ]
}
