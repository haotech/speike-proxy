const Proxy = require('../index.js')

module.exports = function (port) {
  return new Proxy({
    baseUrl: 'http://127.0.0.1:' + port,
    api: {
      pass: {
        options: {
          url: '/user',
          method: 'GET'
        },
        rule: {
          'name': '@NAME',
          'age|0-100': 1
        },
        mock: false
      },

      alarm: {
        options: {
          url: '/user',
          method: 'GET'
        },
        rule: {
          'name': '@NAME',
          'height|150-200': 1
        },
        mock: false
      },

      mock: {
        options: {
          url: '/mock',
          method: 'GET'
        },
        rule: {
          'name': '@NAME',
          'age|0-100': 1,
          'height|150-200': 1
        },
        mock: true
      }
    },
    mock: true,
    alarm: function ({options, rule, data}) {}
  })
}
