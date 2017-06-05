# speike-proxy
[![Build Status](https://travis-ci.org/haotech/speike.svg?branch=master)](https://travis-ci.org/haotech/speike)

一个 Node.js 代理模块~

## 安装

```
$ npm install speike-proxy --save
```

注意：运行以上命令的前提是已经安装了 Node.js 和 npm 。

## 使用

一个简单的例子，向 `http://xxx.com/user` 发送GET请求，获取数据并校验返回数据是否符合 `rule` 中配置的规则。

```
const Proxy = require('speike-proxy');
const proxy = new Proxy({
  baseUrl: 'http://xxx.com',
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
  }
});

proxy.test({...}).then(result => {
  console.log(result.data);
});
```

## 为什么要使用 Speike-proxy？

在前后端分离项目中，Node.js通常作为 `中间层` 来向 `服务端` 发请求来获取数据，并将得到的数据根据不同的业务需求进行特殊处理之后发送给前端做渲染，本身并不直接对数据库进行操作

在此背景下 `中间层` 会面临几个问题

  1. 需要一个使用简单并且功能强大的发送请求的工具来帮助我们请求数据
  2. 服务端接口在没开发完的时候，为了不影响开发进度，我们需要使用Mock数据来进行开发。（使用Mock数据会引发几个问题）
    - Mock数据谁来维护？后端的同学肯定没必要维护两份数据，而我们自己维护如果后端接口有改动，Mock数据与真实接口之间的数据就会发生偏差
    - 日后不需要用Mock数据了，需要切换真实api接口，代码改动会不会很大？
  3. 服务端接口改了不告诉我们怎么办？
    - 很多同学都会遇到过这种情况，前端突然挂了，我们什么都没碰，领导来找之后我们开始debug，最后发现是后端的问题、

使用 Speike-proxy 可以完美解决以上所有问题~

## 功能

- 提供了使用简单且功能强大的发送请求功能
- 无感知切换Mock与真实数据（切换Mock与真实数据只需要改动配置）
- 检查服务端返回数据是否符合事先约定好的数据格式

## 如何使用

一个经典案例

```
const Proxy = require('speike-proxy');
const proxy = new Proxy({
  baseUrl: 'http://xxx.com',
  api: {
    // key为自定义请求方法
    test: {
      options: {
        url: '/user',
        method: 'GET'
      },
      rule: {
        'name': '@NAME',
        'age|0-100': 1
      },
      mock: true
    }
  },

  // 是否开启Mock模式
  mock: false,

  // 服务端返回数据未通过检查时，触发该函数
  alarm: function ({options, rule, data}) {}
});

// 调用自定义方法发送请求
proxy.test({...}).then(result => {
  console.log(result.data);
});
```

## API文档

### 类：`new Proxy(options)`

#### options
 - **baseUrl** String - 可选 目标服务器地址
 - **api** Object - 配置api请求接口以及Mock数据规则
   - **自定义 `Key`** - 将自定义的`key`添加到实例的方法中，访问该方法发送对应的请求，请求选项和Mock规则在`value`中定义
     - **options** Object - 请求选项
     - **rule** Object - Mock数据规则，**Mock模式下会根据该规则生成Mock数据，非Mock模式下，会使用该规则校验服务端返回数据是否符合该规则**
     - **mock** Boolean - 可选 是否启动Mock模式，默认继承父级设置的mock模式
 - **mock** Boolean - 可选 是否启动Mock模式，默认为false
 - **alarm** Function - 可选 当且仅当服务器返回数据格式未通过验证时，触发该函数

### 实例：`proxy[自定义的key](data, callback)`

### 参数
 - **data** Object - 可选 要发送的数据
 - **callback(err, data, res)** Function - 可选 
   - **err** Error - 如果没有错误发生将为 `null`
   - **data** Object - 服务端响应的数据
   - **res** IncomingMessage - Response

#### 例子：
```
proxy.test({...}).then(({data, res}) => {
  console.log('data: ${data}, res: ${res}');
});
```

or 

```
proxy.test({...}, (err, data, res) => {
  console.log('data: ${data}, res: ${res}');
});
```

### 请求选项
 - **url** String - 请求的 `url` 地址
 - **method** String - 可选 设置请求方法，默认是 GET。 支持 GET、POST、PUT、DELETE、PATCH 等所有 HTTP 方法。
 - **dataAsQueryString** Boolean - 可选 如果设置为 true，那么即使在 POST 情况下， 也会强制将 options.data 以 querystring.stringify 处理之后拼接到 url 的 query 参数上。
 - **content** String|Buffer - 可选 发送请求正文，如果设置了此参数，那么会直接忽略 data 参数。
 - **stream** ReadStream - 可选 设置发送请求正文的可读数据流，默认是 null。 一旦设置了此参数，将会忽略 data 和 content。
 - **writeStream** WriteStream - 可选 设置接受响应数据的可写数据流，默认是 null。 一旦设置此参数，那么返回值 result.data 将会被设置为 null， 因为数据已经全部写入到 writeStream 中了。
 - **consumeWriteStream** Boolean - 可选 是否等待 writeStream 完全写完才算响应全部接收完毕，默认是 true。 此参数不建议修改默认值，除非我们明确知道它的副作用是可接受的， 否则很可能会导致 writeStream 数据不完整。
 - **contentType** String - 可选 设置请求数据格式，data 是 object 的时候默认设置的是 form。支持 json 格式，设置为 json 时，自动设置`Content-Type: application/json` 请求头
 - **nestedQuerystring** Boolean - 可选 默认使用querystring转换form data，不支持嵌套对象，设置为true，使用qs模块来代替默认querystring支持嵌套对象
 - **fixJSONCtlChars** Boolean - 可选 是否自动过滤响应数据中的特殊控制字符 (U+0000 ~ U+001F)，默认是 false。 通常一些 CGI 系统返回的 JSON 数据会包含这些特殊控制字符，通过此参数可以自动过滤掉它们。
 - **headers** Object - 可选 自定义请求头。
 - **timeout** Number|Array - 可选 请求超时时间，默认是 [ 5000, 5000 ]，即创建连接超时是 5 秒，接收响应超时是 5 秒。
 - **auth** String - 可选 `username:password` 简单登录授权（Basic Authentication）参数，将以明文方式将登录信息以 Authorization 请求头发送出去
 - **digestAuth** String - 可选 `username:password` 摘要登录授权（Digest Authentication）参数，设置此参数会自动对 401 响应尝试生成 Authorization 请求头， 尝试以授权方式请求一次。
 - **followRedirect** Boolean - 可选 是否自动跟进 3xx 的跳转响应，默认是 false。
 - **maxRedirects** Number - 可选 设置最大自动跳转次数，避免循环跳转无法终止，默认是 10 次。 此参数不宜设置过大，它只在 followRedirect=true 情况下才会生效。
 - **beforeRequest** Function(options) - 可选 在请求正式发送之前，会尝试调用 beforeRequest 钩子，允许我们在这里对请求参数做最后一次修改。
 - **streaming** Boolean - 可选 是否直接返回响应流，默认为 false。 开启 streaming 之后，HttpClient 会在拿到响应对象 res 之后马上返回， 此时 result.headers 和 result.status 已经可以读取到，只是没有读取 data 数据而已。`result.res 是一个 ReadStream 对象`
 - **gzip** Boolean - 可选 是否支持 gzip 响应格式，默认为 false。 开启 gzip 之后，HttpClient 将自动设置 Accept-Encoding: gzip 请求头， 并且会自动解压带 Content-Encoding: gzip 响应头的数据。
 - **timing** Boolean - 可选 是否开启请求各阶段的时间测量，默认为 false。 开启 timing 之后，可以通过 result.res.timing 拿到这次 HTTP 请求各阶段的时间测量值（单位是毫秒）， 通过这些测量值，我们可以非常方便地定位到这次请求最慢的环境发生在那个阶段，效果如同 Chrome network timing 的作用。
   - timing 各阶段测量值解析：
     - queuing：分配 socket 耗时
     - dnslookup：DNS 查询耗时
     - connected：socket 三次握手连接成功耗时
     - requestSent：请求数据完整发送完毕耗时
     - waiting：收到第一个字节的响应数据耗时
     - contentDownload：全部响应数据接收完毕耗时
 - `ca，rejectUnauthorized，pfx，key，cert，passphrase，ciphers，secureProtocol` 这几个都是透传给 [HTTPS](https://nodejs.org/api/https.html) 模块的参数，具体请查看 [`https.request(options, callback)`](https://nodejs.org/api/https.html#https_https_request_options_callback)。

request 部分基于 [urllib](https://github.com/node-modules/urllib/tree/2.22.0) 开发。了解更多请[点我](https://github.com/node-modules/urllib/tree/2.22.0)

### Mock 规则

Mock部分基于 [Mock.js](https://github.com/nuysoft/Mock/) 开发。

Mock 规范包括两部分：

1. 数据模板定义规范
2. 数据占位符定义规范

#### 数据模板定义规范

**数据模板中的每个属性由 3 部分构成：属性名、生成规则、属性值：**

```
// 属性名   name
// 生成规则 rule
// 属性值   value
'name|rule': value
```

**注意：**

 - 属性名 和 生成规则 之间用竖线 | 分隔。
 - 生成规则 是可选的。
 - 生成规则 有 7 种格式：
   1. `'name|min-max': value`
   2. `'name|count': value`
   3. `'name|min-max.dmin-dmax': value`
   4. `'name|min-max.dcount': value`
   5. `'name|count.dmin-dmax': value`
   6. `'name|count.dcount': value`
   7. `'name|+step': value`
 - **生成规则 的 含义 需要依赖 属性值的类型 才能确定。**
 - 属性值 中可以含有 @占位符。
 - 属性值 还指定了最终值的初始值和类型。

**生成规则和示例：**

**1. 属性值是字符串 String**

  1. `'name|min-max': string` 通过重复 string 生成一个字符串，重复次数大于等于 min，小于等于 max。
  2. `'name|count': string` 通过重复 string 生成一个字符串，重复次数等于 count。

**2. 属性值是数字 Number**

  1. `'name|+1': number` 属性值自动加 1，初始值为 number。
  2. `'name|min-max': number` 生成一个大于等于 min、小于等于 max 的整数，属性值 number 只是用来确定类型。
  3. `'name|min-max.dmin-dmax': number` 生成一个浮点数，整数部分大于等于 min、小于等于 max，小数部分保留 dmin 到 dmax 位。

```
{
    'number1|1-100.1-10': 1,
    'number2|123.1-10': 1,
    'number3|123.3': 1,
    'number4|123.10': 1.123
}
// =>
{
    "number1": 12.92,
    "number2": 123.51,
    "number3": 123.777,
    "number4": 123.1231091814
}
```

** 3. 属性值是布尔型 Boolean **
  1. `'name|1': boolean` 随机生成一个布尔值，值为 `true` 的概率是 1/2，值为 `false` 的概率同样是 `1/2`。
  2. `'name|min-max': value` 随机生成一个布尔值，值为 `value` 的概率是 `min / (min + max)`，值为 `!value` 的概率是 `max / (min + max)`。

**4. 属性值是对象 Object**
  1. `'name|count': object` 从属性值 object 中随机选取 count 个属性。
  2. `'name|min-max': object` 从属性值 object 中随机选取 min 到 max 个属性。

**5. 属性值是数组 Array**
  1. `'name|1': array` 从属性值 array 中随机选取 1 个元素，作为最终值。
  2. `'name|+1': array` 从属性值 array 中顺序选取 1 个元素，作为最终值。
  3. `'name|min-max': array` 通过重复属性值 array 生成一个新数组，重复次数大于等于 min，小于等于 max。
  4. `'name|count': array` 通过重复属性值 array 生成一个新数组，重复次数为 count。

**6. 属性值是函数 Function**
  1. `'name': function` 执行函数 function，取其返回值作为最终的属性值，函数的上下文为属性 'name' 所在的对象。

**7. 属性值是正则表达式 RegExp**

  1. `'name': regexp` 根据正则表达式 regexp 反向生成可以匹配它的字符串。用于生成自定义格式的字符串。

```
{
    'regexp1': /[a-z][A-Z][0-9]/,
    'regexp2': /\w\W\s\S\d\D/,
    'regexp3': /\d{5,10}/
}
// =>
{
    "regexp1": "pJ7",
    "regexp2": "F)\fp1G",
    "regexp3": "561659409"
}
```

#### 数据占位符定义规范

占位符 只是在属性值字符串中占个位置，并不出现在最终的属性值中。

占位符 的格式为：

```
@占位符
@占位符(参数 [, 参数])
```

**注意：**

1. 用 @ 来标识其后的字符串是 占位符。
2. 占位符 引用的是 Mock.Random 中的方法。
3. 通过 Mock.Random.extend() 来扩展自定义占位符。
4. 占位符 也可以引用 数据模板 中的属性。
5. 占位符 会优先引用 数据模板 中的属性。
6. 占位符 支持 相对路径 和 绝对路径。

```
{
    name: {
        first: '@FIRST',
        middle: '@FIRST',
        last: '@LAST',
        full: '@first @middle @last'
    }
}
// =>
{
    "name": {
        "first": "Charles",
        "middle": "Brenda",
        "last": "Lopez",
        "full": "Charles Brenda Lopez"
    }
}
```