const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api/*',
    createProxyMiddleware({
      target: 'http://localhost:3100',
      changeOrigin: true
    })
  )
  app.use(
    '/job/build',
    createProxyMiddleware({
      target: 'http://localhost:3100',
      changeOrigin: true
    })
  )
}
