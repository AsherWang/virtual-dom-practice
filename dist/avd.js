"use strict";

/* eslint-disable*/
(function (global) {
  "use strict";

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable no-unused-vars */
// 为了拿到真的对象
// _NodeGetter保存一个对象obj和一个对象的key
// 通过_NodeGetter修改obj[key]的时候可以直接修改原来obj对象的属性
// e.g.
// arr = [1,2];
// ng = _NodeGetter([1,2],0);
// ng.value = 2;
// 则有arr => [2,2]
var _NodeGetter =
/*#__PURE__*/
function () {
  function _NodeGetter(source, info) {
    _classCallCheck(this, _NodeGetter);

    this.source = source;
    this.info = info;
  }

  _createClass(_NodeGetter, [{
    key: "value",
    get: function get() {
      if (this.info !== undefined) {
        return this.source[this.info];
      }

      return this.source;
    },
    set: function set(newVlaue) {
      if (this.info !== undefined) {
        this.source[this.info] = newVlaue;
      } else {
        this.source = newVlaue;
      }
    }
  }]);

  return _NodeGetter;
}(); // NodeGetter()和new NodeGetter()效果一样
// eslint-disable-next-line no-unused-vars


var NodeGetter = new Proxy(_NodeGetter, {
  apply: function apply(target, thisArg, argumentsList) {
    // eslint-disable-next-line
    return _construct(target, _toConsumableArray(argumentsList));
  }
}); // 预期返回两个节点的变化了的属性
// 如果属性相同，那么返回null

function diffProps(oldNode, newNode) {
  var oldProps = oldNode.props;
  var newProps = newNode.props;
  var propsPatchs = {};
  var isSame = true; // 遍历旧的，找到修改了的
  // 删掉的也属于修改了的

  Object.keys(oldProps).forEach(function (key) {
    if (newProps[key] !== oldProps[key]) {
      isSame = false;
      propsPatchs[key] = [oldProps[key], newProps[key]];
    }
  }); // 遍历新的，找到新的属性

  Object.keys(newProps).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(oldProps, key)) {
      isSame = false;
      propsPatchs[key] = [null, newProps[key]];
    }
  });
  return isSame ? null : propsPatchs;
} // 对节点应用变化的属性
// TODO: 注意事件的绑定问题


function applyProps(node, props) {
  if (typeof node === 'string' || node.isText) {
    // eslint-disable-next-line
    console.warn('no way here: set props for a textnode');
  }

  if (props) {
    var propNames = Object.keys(props);

    if (propNames.length > 0) {
      propNames.forEach(function (propName) {
        // eslint-disable-next-line
        node.props[propName] = props[propName][1];
        node.setAttr(propName, props[propName][1], props[propName][0]);
      });
    }
  }
} // diff处理两组孩子节点
// 问题，怎么确定两个节点是同一个节点呢，仅仅靠tagname? 目前的做法是这样
// 如果有key且唯一,考虑reorder,remove
// 否则考虑粗暴按序处理


function diffArr(oldArr, newArr) {
  var num = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var patchs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (oldArr.length === 0) {
    return patchs;
  } // const set = new Set(oldArr.map(i => i.key));
  // const hasKey = set.size === oldArr.length;


  var hasKey = false; // 暂且不考虑有key的情况，这里作为优化点

  if (hasKey) {// 有key且唯一
    // REORDER
  } else {
    // 准备处理下一层
    var newOldArr = [];
    var newNewArr = [];
    var length = Math.max(oldArr.length, newArr.length); // 处理当前层

    for (var index = 0; index < length; index += 1) {
      var oldItem = oldArr[index];
      var newItem = newArr[index];

      if (oldItem && newItem) {
        var eleKey = num + index + 1;
        newOldArr = newOldArr.concat(oldItem.children || []);
        newNewArr = newNewArr.concat(newItem.children || []);

        if (oldItem.isText) {
          if (newItem.isText) {
            if (oldItem.text !== newItem.text) {
              // eslint-disable-next-line
              patchs[eleKey] = {
                // TEXT
                type: 'TEXT',
                text: newItem.text
              };
            }
          } else {
            // eslint-disable-next-line
            patchs[eleKey] = {
              // 替换节点
              type: 'REPLACE',
              node: newItem
            };
          }
        } else if (newItem.tagName !== oldItem.tagName) {
          // console.log('replace',oldItem,newItem)
          // eslint-disable-next-line
          patchs[eleKey] = {
            // 替换节点
            type: 'REPLACE',
            node: newItem
          };
        } else {
          // 如果是同一个子节点
          var propsPatchs = diffProps(oldItem, newItem); // console.log('propsPatchs',propsPatchs)

          if (propsPatchs) {
            // eslint-disable-next-line
            patchs[eleKey] = {
              type: 'PROPS',
              props: propsPatchs
            };
          }
        }
      } else if (oldItem) {
        var _eleKey = num + newArr.length + 1; // console.log('remove node', eleKey, oldItem);


        if (patchs[_eleKey]) {
          patchs[_eleKey].moves.push({
            index: index,
            type: 0,
            node: oldItem
          });
        } else {
          // eslint-disable-next-line
          patchs[_eleKey] = {
            // 删掉当前节点
            type: 'REORDER',
            moves: [{
              index: index,
              type: 0,
              node: oldItem
            }]
          };
        }
      } else {
        var _eleKey2 = num + oldArr.length;

        if (patchs[_eleKey2]) {
          patchs[_eleKey2].moves.push({
            index: index,
            type: 1,
            node: newItem
          });
        } else {
          // eslint-disable-next-line
          patchs[_eleKey2] = {
            // 删掉当前节点
            type: 'REORDER',
            moves: [{
              index: index,
              type: 1,
              node: newItem
            }]
          };
        }
      }
    }

    return diffArr(newOldArr, newNewArr, num + oldArr.length, patchs);
  }

  return patchs;
} // 虚拟dom的diff算法
// 预期返回新旧tree之间的差别
// 平层diff
// 对oldTree的节点标记, root为0, 其孩子节点依次为1,2,3,4


function diff(oldTree, newTree) {
  return diffArr([oldTree], [newTree], -1);
} // 为虚拟DOM构建索引
// 为了简单先放到oldTree对象上


function buildIndex(oldTree) {
  var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // 非递归广搜
  var indexs = []; // 根节点入栈

  indexs.push(NodeGetter(oldTree));

  var _loop = function _loop(idx) {
    var currentNode = indexs[idx].value;

    if (typeof currentNode !== 'string' && currentNode.children && currentNode.children.length > 0) {
      // not textnode and has children
      currentNode.children.forEach(function (child, index) {
        var id = index;
        indexs.push(NodeGetter(currentNode.children, id));
      });
    }
  };

  for (var idx = 0; idx < indexs.length; idx += 1) {
    _loop(idx);
  } // eslint-disable-next-line


  oldTree.indexs = indexs;
} // 对虚拟dom应用diff结果
// 是不是需要对oldTree建立索引或者在使用Element构建的时候就建立索引


function applyDiff(oldTree, patchs) {
  if (patchs) {
    var keys = Object.keys(patchs);

    if (keys.length > 0) {
      buildIndex(oldTree); // console.log('oldTree', oldTree);

      keys.forEach(function (key) {
        // key其实就是索引
        var patch = patchs[key];

        if (patch.type === 'REPLACE') {
          var oldEl = oldTree.indexs[key].value.$el;

          if (oldEl) {
            oldEl.parentNode.replaceChild(patch.node.render(), oldEl);
          } // eslint-disable-next-line


          oldTree.indexs[key].value = patch.node;
        } else if (patch.type === 'PROPS') {
          applyProps(oldTree.indexs[key].value, patch.props);
        } else if (patch.type === 'TEXT') {
          var oldNode = oldTree.indexs[key].value;
          var _oldEl = oldNode.$el;

          if (_oldEl) {
            oldNode.text = patch.text;
            _oldEl.nodeValue = patch.text;
          }
        } else if (patch.type === 'REORDER') {
          // TO PERF
          // 这里写的有点奇怪，像是在强行使用REORDER
          // 先删除
          patch.moves.filter(function (a) {
            return a.type === 0;
          }).sort(function (a, b) {
            return a.index < b.index ? 1 : -1;
          }).forEach(function (move) {
            // console.log('remove index', move.index);
            var source = oldTree.indexs[key].source;

            if (move.node && move.node.$el && move.node.$el.parentNode) {
              move.node.$el.parentNode.removeChild(move.node.$el);
            }

            source.splice(source.findIndex(function (a) {
              return a === move.node;
            }), 1);
          }); // 补充

          patch.moves.filter(function (a) {
            return a.type === 1;
          }).sort(function (a, b) {
            return a.index > b.index ? 1 : -1;
          }).forEach(function (move) {
            // console.log('append index', move.index);
            var _oldTree$indexs$key = oldTree.indexs[key],
                source = _oldTree$indexs$key.source,
                value = _oldTree$indexs$key.value;

            if (source && source.length > 0) {
              source[0].$el.parentNode.appendChild(move.node.render());
            }

            oldTree.indexs[key].source.push(move.node);
          });
        }
      }); // console.log('after apply', oldTree);
    }
  }
}
"use strict";

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable no-undef */
// 自定义组件
var _Component =
/*#__PURE__*/
function () {
  function _Component(props) {
    _classCallCheck(this, _Component);

    this.state = {};
    this.props = props;
    this.preRendered = null;
  } // may partly update


  _createClass(_Component, [{
    key: "setState",
    value: function setState(newState) {
      Object.assign(this.state, newState);
      var result = diff(this.preRendered, this.render());
      applyDiff(this.preRendered, result);
    } // mount rendered content to el
    // mount just called once

  }, {
    key: "mount",
    value: function mount(el) {
      if (el.firstElementChild) {
        el.firstElementChild.remove();
      }

      this.preRendered = this.render();

      if (this.preRendered) {
        el.appendChild(this.preRendered.render());
      }
    } // override this

  }, {
    key: "render",
    value: function render() {
      return null;
    }
  }]);

  return _Component;
}(); // 使得Element()和new Element()效果一样
// eslint-disable-next-line no-unused-vars


var KComponent = new Proxy(_Component, {
  apply: function apply(target, thisArg, argumentsList) {
    // eslint-disable-next-line
    return _construct(target, _toConsumableArray(argumentsList));
  }
});
"use strict";

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable no-undef */
// 提供类或者对象到html标签的映射关系
var _Element =
/*#__PURE__*/
function () {
  function _Element(tagName, props, children) {
    var _this = this;

    _classCallCheck(this, _Element);

    this.tagName = tagName; // 对应的dom节点标签

    this.props = props || {}; // 属性

    this.children = children || []; // 孩子节点

    this.key = props ? props.key : undefined; // 备用，diff使用，目前还没用到

    this.isText = false; // 是否是纯文本节点

    this.text = ''; // 如果是纯文本节点，text存入文本内容
    // init

    var count = 0;
    this.children.forEach(function (child, index) {
      if (child instanceof _Element) {
        count += child.count;
      } else if (child instanceof _Component) {
        _this.children[index] = child.render();
      } else {
        var textNode = new _Element();
        textNode.isText = true;
        textNode.text = child;
        _this.children[index] = textNode;
      }

      count += 1;
    });
    this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
  } // 预期返回结果是一个HTML DOM节点对象
  // 如果children有内容，按顺序将child渲染并添加到父节点内部


  _createClass(_Element, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      if (this.isText) {
        var _el = document.createTextNode(this.text);

        this.$el = _el;
        return _el;
      }

      var el = document.createElement(this.tagName);
      this.$el = el;
      var props = this.props;
      Object.keys(props).forEach(function (propName) {
        _this2.setAttr(propName, props[propName]);
      });
      this.children.forEach(function (child) {
        var childEl = child && child.render();

        if (childEl) {
          el.appendChild(childEl);
        }
      });
      return el;
    } // 设置当$el的属性

  }, {
    key: "setAttr",
    value: function setAttr(name, value, preValue) {
      if (typeof value === 'function' && name.startsWith('@')) {
        // 绑定事件
        var evtName = name.slice(1); // 可能需要判断是不是原生事件之类的，这里还没有自定义组件所以只有原生事件
        // if (this.$el.parentNode) {
        //   const elClone = this.$el.cloneNode(true);
        //   this.$el.parentNode.replaceChild(elClone, this.$el);
        //   this.$el = elClone;
        // }

        if (preValue) {
          this.$el.removeEventListener(evtName, preValue);
        }

        this.$el.addEventListener(evtName, value);
      } else {
        this.$el.setAttribute(name, value);
      }
    }
  }]);

  return _Element;
}(); // 使得Element()和new Element()效果一样
// eslint-disable-next-line no-unused-vars


var KElement = new Proxy(_Element, {
  apply: function apply(target, thisArg, argumentsList) {
    // eslint-disable-next-line
    return _construct(target, _toConsumableArray(argumentsList));
  }
});
  global.avd = {
    diff: diff,
    applyDiff: applyDiff,
    KElement: KElement,
    KComponent: KComponent
  };
})(window);