module.exports = {
  content: {
    permalink: ":slug",
    isPost: false,
    routes: [
      {
        name: "index-slug",
        method: "get"
      },
      {
        name: "index",
        method: "getAll"
      }
    ]
  }
}
