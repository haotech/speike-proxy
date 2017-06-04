const http = require('http')
const url = require('url')

module.exports = function (port) {
  const server = http.createServer((req, res) => {
    const path = url.parse(req.url).pathname

    const router = function (route, maps) {
      maps[route] ? maps[route]() : maps['*']()
    }

    router(path, {
      '/user': () => {
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({
          name: 'Berwin',
          age: 22
        }))
      },
      '*': () => {
        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.end(path)
      }
    })
  })

  server.listen(port)

  return () => {
    server.close()
  }
}
