const Mock = require('mockjs');

module.exports = (rule, callback) => {
  const data = Mock.mock(rule);
  const ø = Object.create(null);

  callback && callback(null, data, ø);

  return Promise.resolve({data: data, res: ø});
};