# 简介

- 简易AMD规范实现

# 开始

- 引入index.js

````html
    <body>
      <script src="index.js"></script>
      <script src="main.js"></script>
    </body>
````

- main.js

````javascript
  define(['./a.js'], function(require, module, exports) {
    console.log(require('./a.js'));
  });

````
- a.js

````javascript
  define(function(require, module, exports) {
    module.exports = 'hello world';
  });

````