const PEDDING = 'pedding';
const RESOLVED = 'resolved';
const REJECT = 'rejected';

const scriptNodeList = document.getElementsByTagName('script');

function define(deps, moduleFunc) {
  if(!(this instanceof define)) {
    return new define(deps, moduleFunc);
  }
  if(typeof deps === 'function') {
    moduleFunc = deps;
    deps = [];
  }
  this.deps = deps;
  this.moduleFunc = moduleFunc;
  this.moduleId = this.getOwnModuleId();

  this.loadDeps(deps);
}

define.prototype.__modules = {};
define.prototype.appendScript = function(path) {
  const script = document.createElement('script');
  script.src = path;
  document.body.appendChild(script);
  script.addEventListener('load', function() {
    document.body.removeChild(script);
  }); 
}
define.prototype.require = function(path) {
  try {
    return this.__modules[resolve(path)].module.exports;
  } catch(e) {
    throw new Error('This module' + path + ' is not defined');
  }
}
define.prototype.setModule = function(moduleId, cb) {
  return this.__modules[moduleId] = {
    status: PEDDING,
    module: { },
    cb: cb || []
  };
}
define.prototype.loadDeps = function(deps) {

  const len = deps.length;
  let self = null;
  let count = 0;
  const exec = function () {
    if(++ count >= len) {
      this.moduleFunc(
        this.require.bind(this),
        self.module,
        self.module.exports
      );
      self.status = RESOLVED;
      self.cb.forEach(function(item) {
        item();
      });
    }
  }.bind(this);

  if(!(self = this.__modules[this.moduleId])) {
    self = this.setModule(this.moduleId);
  }

  deps.forEach(function(path) {
    
    const moduleId = resolve(path);

    if(this.__modules[moduleId]) {
      if(this.__modules[moduleId].status === RESOLVED) {
        count ++;
      } else if(this.__modules[moduleId].status === PEDDING) {
        this.__modules[moduleId].cb.push(exec);
      } else {
        throw new Error('Failed to load resource: ' + path);
      }
    } else {
      this.__modules[moduleId] = {
        status: PEDDING,
        module: { },
        cb: [exec]
      };  
    }

    this.appendScript(moduleId);

  }.bind(this));

  if(deps.length === 0 || count === len) {
    exec();
  }
}
define.prototype.getOwnModuleId = function() {
  return scriptNodeList[scriptNodeList.length - 1].src;
}

function resolve() {
  const POT_REG = /\.+$/;
  arguments[0] = window.location.href + arguments[0];
  const path = [].slice.call(arguments)
    .join('/')
    .split('/');

  for(let i = 0, len = path.length; i < len; i ++) {
    const point = path[i].match(POT_REG);
    if(point) {
      for(let j = point[0].length - 1; j >= 0; j --) {
        path[i - j] = '';
      }
    }
  }
  return path.join('/').replace(/(\w)\/+/g, function($1, $2) {
    return $2 + '/';
  });
}