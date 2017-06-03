const Proxy = require('../index.js');

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
    },
    mock: true,
    alarm: function ({options, rule, data}) {
      console.log('----------- Warning Server Data Error------------');
      console.log({options, rule, data});
      console.log('----------- Warning End ------------');
    }
  })
};