module.exports = {
  content: {
    permalink: "/:slug",
    isPost: false,
    routes: [
      {
        path: "_slug",
        method: "get"
      }
    ]
  }
}
