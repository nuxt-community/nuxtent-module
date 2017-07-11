export const response = (res) => ({
  success(data) {
    res.setHeader('Content-Type', 'application/json')
    res.end(data, 'utf-8')
    console.log(`   Response sent successfully.`)
  },
  error(err) {
    console.log(`   Failed to send response.`, error)
    res.statusCode = 500
    res.statusMessage = 'Internal Server Error'
    res.end(err.stack || String(err))
  },
  notFound() {
    console.log(`   Page not found.`)
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
  }
})
