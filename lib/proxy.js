const assert = require('assert');
const request = require('./request/index.js');
const mock = require('./mock/index.js');

const BASE_URL = Symbol('Speike-proxy#baseUrl');
const OPTIONS = Symbol('Speike-proxy#options');
const INIT = Symbol('Speike-proxy#init');
const REQUEST = Symbol('Speike-proxy#request');
const MOCK = Symbol('Speike-proxy#mock');
const ALARM = Symbol('Speike-proxy#alarm');

class Proxy {
  constructor(options) {
    assert(options.api, 'should pass options.api');
    this[OPTIONS] = options;
    this[BASE_URL] = options.baseUrl;
    this[ALARM] = options.alarm;

    // Initialization
    this[INIT]();
  }

  [INIT]() {
    const api = this[OPTIONS].api;
    for (let name of Object.keys(api)) {
      Proxy.prototype[name] = function (data, callback) {
        const isMock = api[name].hasOwnProperty('mock') ? api[name]['mock'] : 
          this[OPTIONS].hasOwnProperty('mock') ? this[OPTIONS]['mock'] : false;

        if (isMock) {
          return this[MOCK](api[name].rule, callback);
        } else {
          return this[REQUEST](api[name], data, callback);
        }
      }
    }
  }

  [REQUEST]({options, rule}, data, callback) {
    const baseUrl = this[BASE_URL];
    const alarm = this[ALARM];
    const url = options.url;
    options.data = data;
    delete options.url;
    return request(
      baseUrl ? baseUrl + url : url,
      options,
      rule,
      {alarm, callback}
    );
  }

  [MOCK](rule, callback) {
    return mock(rule, callback);
  }
}

module.exports = Proxy;