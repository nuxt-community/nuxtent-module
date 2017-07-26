module.exports = {
  content: {
    permalink: ":slug",
    isPost: false,
    routes: [
      {
        name: "guide-slug",
        method: "get"
      },
      {
        name: "guide",
        method: "getAll"
      }
    ]
  }
}
