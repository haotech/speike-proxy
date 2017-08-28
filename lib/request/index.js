const urllib = require('urllib')
const Mock = require('mockjs')

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
