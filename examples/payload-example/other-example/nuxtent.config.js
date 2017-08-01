module.exports = {
  content: {
    permalink: ":slug",
    isPost: false,
    routes: [
      {
        path: "/guide/_slug",
        method: "get"
      },
      {
        path: "/guide",
        method: "getAll"
      }
    ]
  }
}
