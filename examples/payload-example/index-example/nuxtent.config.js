module.exports = {
  content: {
    permalink: ":slug",
    isPost: false,
    routes: [
      {
        path: "/index/_slug",
        method: "get"
      },
      {
        path: "/index",
        method: "getAll"
      }
    ]
  }
}
