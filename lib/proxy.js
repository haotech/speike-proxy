const assert = require('assert')
const urllib = require('urllib')
const Mock = require('mockjs')

const BASE_URL = Symbol('Speike-proxy#baseUrl')
const OPTIONS = Symbol('Speike-proxy#options')
const INIT = Symbol('Speike-proxy#init')
const REQUEST = Symbol('Speike-proxy#request')
const MOCK = Symbol('Speike-proxy#mock')
const ALARM = Symbol('Speike-proxy#alarm')

const toString = Object.prototype.toString

class Proxy {
  constructor (options) {
    assert(options.api, 'should pass options.api')
    this[OPTIONS] = options
    this[BASE_URL] = options.baseUrl
    this[ALARM] = options.alarm

    // Initialization
    this[INIT]()
  }

  [INIT] () {
    const api = this[OPTIONS].api
    const proto = Proxy.prototype
    for (let name of Object.keys(api)) {
      proto[name] = function (data, callback) {
        if (toString.call(data) === '[object Function]') {
          callback = data
          data = null
        }

        const isMock = api[name].hasOwnProperty('mock') ? api[name]['mock']
          : this[OPTIONS].hasOwnProperty('mock') ? this[OPTIONS]['mock'] : false

        if (isMock) {
          return this[MOCK](api[name].rule, callback)
        } else {
          return this[REQUEST](api[name], data, callback)
        }
      }
    }
  }

  [REQUEST] ({options, rule}, data, callback) {
    const baseUrl = this[BASE_URL]
    const alarm = this[ALARM]
    return this.request({
      baseUrl,
      options,
      rule,
      data,
      alarm,
      Mock,
      callback
    })
  }

  [MOCK] (rule, callback) {
    return this.mockdata(rule, callback)
  }

  mockdata (rule, callback) {
    const data = Mock.mock(rule)
    callback && callback(null, data, Object.create(null))
    return Promise.resolve({data, res: {status: 200}})
  }

  request ({baseUrl, options, rule, data, alarm, Mock, callback}) {
    options = Object.assign({}, options)
    const url = baseUrl
      ? baseUrl + options.url
      : options.url
    options.data = data
    delete options.url

    return urllib.request(url, options).then((result) => {
      let data = null
      try {
        data = JSON.parse(result.data.toString())
      } catch (err) {
        throw new Error('The API interface returns an incorrect data format')
      }

      if (Mock.valid(rule, data).length) {
        alarm && alarm.call(Object.create(null), {options, rule, data})
        throw new Error('The API interface returns an incorrect data format')
      } else {
        callback && callback(null, data, result.res)
      }
      return {data, res: result.res}
    })
  }
}

module.exports = Proxy
