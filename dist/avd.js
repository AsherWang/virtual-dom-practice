"use strict";

/* eslint-disable*/
(function (global) {
  "use strict";

/* eslint-disable no-unused-vars */
// 预期返回两个节点的变化了的属性
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
    var newNewArr = []; // 处理当前层

    for (var index = 0; index < oldArr.length; index += 1) {
      var oldItem = oldArr[index];
      var eleKey = num + index + 1; // console.log('eleKey',eleKey, oldItem);

      newOldArr = newOldArr.concat(oldItem.children || []);

      if (index > newArr.length - 1) {
        // eslint-disable-next-line
        patchs[eleKey] = {
          // 删掉当前节点
          type: 'REORDER',
          moves: [{
            index: index,
            type: 0
          }]
        };
      } else {
        var newItem = newArr[index];
        newNewArr = newNewArr.concat(newItem.children || []);

        if (typeof oldItem === 'string') {
          if (typeof newItem === 'string') {
            if (oldItem !== newItem) {
              // eslint-disable-next-line
              patchs[eleKey] = {
                // TEXT
                type: 'TEXT',
                text: newItem
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
}
"use strict";

function Element(tagName, props, children) {
  // 让Element(...) 和 new Element(...)有一样的行为
  if (!(this instanceof Element)) {
    return new Element(tagName, props, children);
  }

  this.tagName = tagName;
  this.props = props || {};
  this.children = children || [];
  this.key = props ? props.key : undefined;
  var count = 0;
  this.children.forEach(function (child) {
    if (child instanceof Element) {
      count += child.count;
    }

    count += 1;
  });
  this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
} // 脑补的


function setAttr(el, name, value) {
  el.setAttribute(name, value);
} // 预期返回结果是一个HTML DOM节点对象
// 如果children有内容，按顺序将child渲染并添加到父节点内部


Element.prototype.render = function render() {
  var el = document.createElement(this.tagName);
  var props = this.props;
  Object.keys(props).forEach(function (propName) {
    setAttr(el, propName, props[propName]);
  });
  this.children.forEach(function (child) {
    var childEl = child instanceof Element ? child.render() : document.createTextNode(child);
    el.appendChild(childEl);
  });
  return el;
};
  global.avd = {
    diff: diff,
    Element: Element
  };
})(window);