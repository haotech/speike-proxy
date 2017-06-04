const test = require('ava')
const startServer = require('./server.js')
const proxy = require('./proxy.js')(1995)
let stopServer = null

test.before(() => {
  stopServer = startServer(1995)
})

test('should check server return data and passed', t => {
  return proxy.pass().then(result => {
    t.is(result.res.status, 200)
  })
})

test('Should check server return data and throw error', t => {
  return proxy.alarm().catch(() => {
    t.pass()
  })
})

test('Should trigger alarm when data check fails', t => {
  t.plan(2)
  const _Proxy = require('../index.js')
  const _proxy = new _Proxy({
    baseUrl: 'http://127.0.0.1:1995',
    api: {
      test: {
        options: {
          url: '/user',
          method: 'GET'
        },
        rule: {
          'name': '@NAME',
          'height|150-200': 1
        }
      }
    },
    alarm: function ({options, rule, data}) {
      t.pass()
    }
  })
  return _proxy.test().catch(() => {
    t.pass()
  })
})

test('Should return mock data', t => {
  return proxy.mock().then(result => {
    t.true(toString.call(result.data.name) === '[object String]')
    t.true(toString.call(result.data.age) === '[object Number]')
    t.true(toString.call(result.data.height) === '[object Number]')
    t.is(result.res.status, 200)
  })
})

test('Should support for switching data sources', t => {
  let isMock = false
  const _Proxy = require('../index.js')
  const _proxy = new _Proxy({
    baseUrl: 'http://127.0.0.1:1995',
    api: {
      test: {
        options: {
          url: '/user',
          method: 'GET'
        },
        rule: {
          'name': '@NAME',
          'age|0-100': 1
        }
      }
    },
    get mock () {
      return isMock
    }
  })
  return _proxy.test().then(result => {
    t.deepEqual(result.data, {name: 'Berwin', age: 22})
    t.is(result.res.status, 200)
    isMock = true
    t.pass()
  }).then(() => _proxy.test()).then(result => {
    t.true(toString.call(result.data.name) === '[object String]')
    t.true(toString.call(result.data.age) === '[object Number]')
    t.is(result.res.status, 200)
    t.pass()
  })
})

test.after(t => {
  stopServer()
})
