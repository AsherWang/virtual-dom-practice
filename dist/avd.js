"use strict";

/* eslint-disable*/
(function (global) {
  "use strict";

/* eslint-disable no-unused-vars */
// 预期返回两个节点的变化了的属性
// TODO: 怎么处理事件,这里应该不考虑事件
function diffProps(oldNode, newNode) {
  var oldProps = oldNode.props;
  var newProps = newNode.props; // console.log('oldProps',oldProps)
  // console.log('newProps',newProps)

  var propsPatchs = {};
  var isSame = true; // 遍历旧的，找到修改了的

  Object.keys(oldProps).forEach(function (key) {
    if (newProps[key] !== oldProps[key]) {
      isSame = false;
      propsPatchs[key] = newProps[key];
    }
  }); // 遍历新的，找到新的属性

  Object.keys(newProps).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(oldProps, key)) {
      isSame = false;
      propsPatchs[key] = newProps[key];
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
        node.props[propName] = props[propName];
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
            node: newItem
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
  var num = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var patchs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  // 判断节点类型是否一致
  if (oldTree.tagName !== newTree.tagName) {
    // eslint-disable-next-line
    patchs[num] = {
      type: 'REPLACE',
      node: newTree
    };
  } else {
    var propsPatchs = diffProps(oldTree, newTree);

    if (propsPatchs) {
      // eslint-disable-next-line
      patchs[num] = {
        type: 'PROPS',
        props: propsPatchs
      };
    } // eslint-disable-next-line


    patchs = diffArr(oldTree.children, newTree.children, num, patchs);
  }

  return patchs;
} // 为了拿到真的对象


function NodeGetter(source, info) {
  if (!(this instanceof NodeGetter)) {
    return new NodeGetter(source, info);
  }

  this.source = source;
  this.info = info;
  Object.defineProperty(this, 'value', {
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
  });
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
          // eslint-disable-next-line
          oldTree.indexs[key].value = patch.node;
        } else if (patch.type === 'PROPS') {
          applyProps(oldTree.indexs[key].value, patch.props);
        } else if (patch.type === 'TEXT') {
          // eslint-disable-next-line
          oldTree.indexs[key].value.text = patch.text; // 这个不行吧。。。
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
            source.splice(source.findIndex(function (a) {
              return a === move.node;
            }), 1);
          }); // 先补充

          patch.moves.filter(function (a) {
            return a.type === 1;
          }).sort(function (a, b) {
            return a.index > b.index ? 1 : -1;
          }).forEach(function (move) {
            // console.log('append index', move.index);
            oldTree.indexs[key].source.push(move.node);
          });
        }
      }); // console.log('after apply', oldTree);
    }
  }
}
"use strict";

function Element(tagName, props, children) {
  var _this = this;

  // 让Element(...) 和 new Element(...)有一样的行为
  if (!(this instanceof Element)) {
    return new Element(tagName, props, children);
  }

  this.tagName = tagName;
  this.props = props || {};
  this.children = children || [];
  this.key = props ? props.key : undefined;
  this.isText = false;
  this.text = '';
  var count = 0;
  this.children.forEach(function (child, index) {
    if (child instanceof Element) {
      count += child.count;
    } else {
      var textNode = new Element();
      textNode.isText = true;
      textNode.text = child;
      _this.children[index] = textNode;
    }

    count += 1;
  });
  this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
} // 脑补的


function setAttr(el, name, value) {
  if (typeof value === 'function' && name.startsWith('@')) {
    // 绑定事件
    var evtName = name.slice(1); // 可能需要判断是不是原生事件之类的，这里还没有自定义组件所以只有原生事件
    // el.removeEventListener(evtName); // 移除所有的原绑定事件，嗯。。。

    el.addEventListener(evtName, value);
  } else {
    el.setAttribute(name, value);
  }
} // 预期返回结果是一个HTML DOM节点对象
// 如果children有内容，按顺序将child渲染并添加到父节点内部


Element.prototype.render = function render() {
  if (this.isText) {
    return document.createTextNode(this.text);
  }

  var el = document.createElement(this.tagName);
  var props = this.props;
  Object.keys(props).forEach(function (propName) {
    setAttr(el, propName, props[propName]);
  });
  this.children.forEach(function (child) {
    var childEl = child.render();
    el.appendChild(childEl);
  });
  this.$el = el;
  return el;
};

Element.prototype.setAttr = function eSetAttr(name, value) {
  setAttr(this.$el, name, value);
};
  global.avd = {
    diff: diff,
    applyDiff: applyDiff,
    Element: Element
  };
})(window);