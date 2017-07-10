// const { join } = require('path')
//
// const getContent = (registeredDir, contentData) => {
//   // make into a map key
//   const content = contentData[join('/', registeredDir)]
//
//   return {
//     get (path) { // return data for a single page based on matching permalink
//       const keys = Object.keys(content)
//       for (let i = 0; i < keys.length; i++) {
//         const pageData = content[keys[i]].data
//         const pagePath = join('/' + pageData.permalink)
//         if (pagePath === path) return pageData
//       }
//     },
//
//     getAll () { // return data for all pages under requested directory
//       return Object.keys(content).map(key => content[key].data)
//     }
//   }
// }
//
//
// export default ({ app }) => {
//   const contentData = <%= JSON.stringify(options.content) %>
//   app.$content = (registeredDir) => getContent(registeredDir, contentData)
// }
