# speike
A proxy module for koa.js

## Example

```
const Proxy = require('proxy');
const proxy = new Proxy({
  baseUrl: 'http://xxx.com',
  api: {
    aa: {
      options: {
        url: '/aa',
        method: 'POST'
      },
      rule: {
        first: '@FIRST',
        middle: '@FIRST',
        last: '@LAST'
      },
      mock: true
    },

    bb: {
      options: {
        url: '/bb',
        method: 'GET'
      },
      rule: {
        first: '@FIRST',
        middle: '@FIRST',
        last: '@LAST'
      },
      mock: false
    }
  },
  mock: true,
  alarm: function ({name, options, rule, data}) {} // 服务端返回数据校验失败
});

proxy.aa({...}).then(res => res.json).then(data => {
  console.log(data);
});

proxy.bb({...}).then(res => res.json).then(data => {
  console.log(data);
});
```