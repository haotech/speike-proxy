const urllib = require('urllib');
const Mock = require('mockjs');

/**
 * Request, Send request and verify return result
 * 
 * ```
 * request(url, options, rule[, {alarm, options}])
 * ```
 *
 * @param {String} The URL to request
 * @param {Object} Request options
 * @param {Object} Response result rule
 * @param {Object} other - Optional
 * - {Function} alarm - Triggered when the result check fails
 * - {Function} callback - Triggered when the result check Success
 */
module.exports = (url, options, rule, {alarm, callback}) => {
  return urllib.request(url, options).then((result) => {
    const data = JSON.parse(result.data.toString());
    if (!diff(data, Mock.mock(rule))) {
      alarm && alarm.call(Object.create(null), {options, rule, data});
    } else {
      callback && callback(null, data, result.res);
    }
    return {data, res: result.res};
  });
};

/**
 * Diff, based on target and expect, determine the
 * target's key and value are in line with expectations
 *
 * @param {*} target
 * @param {*} expect
 * @return {Boolean}
 */

const toString = Object.prototype.toString;

function diff(target, expect) {
  if (toString.call(target) !== toString.call(expect)) return false;

  if (toString.call(target) === '[object Object]') {
    return Object.keys(expect).every(key => {
      const name = key.split('|')[0];

      if (toString.call(target[name]) !== toString.call(expect[key])) return false;
      if (!target.hasOwnProperty(name)) return false;
      
      return diff(target[name], expect[key]);
    });
  }

  if (toString.call(target) === '[object Array]') {
    if (target.length > 0 && expect.length > 0) {
      return diff(target[0], expect[0]);
    }
  }

  return true;
}