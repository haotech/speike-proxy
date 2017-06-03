const test = require('ava');
const startServer = require('./server.js');
const proxy = require('./proxy.js')(1995);
let stopServer = null;

test.before(() => {
  stopServer = startServer(1995);
});

test('should check server return result and Passed', t => {
  return proxy.pass().then(result => {
    t.is(result.res.status, 200);
  });
});

test.after(t => {
  stopServer();
});