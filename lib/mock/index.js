const Mock = require('mockjs');

module.exports = (rule, callback) => {
  const data = Mock.mock(rule);
  callback && callback(null, data, Object.create(null));
  return Promise.resolve({data, res: {status: 200}});
};