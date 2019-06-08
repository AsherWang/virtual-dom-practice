/* eslint-disable no-unused-vars */
// 预期返回两个节点的变化了的属性
function diffProps(oldNode, newNode) {
  const oldProps = oldNode.props;
  const newProps = newNode.props;


  // console.log('oldProps',oldProps)
  // console.log('newProps',newProps)

  const propsPatchs = {};
  let isSame = true;

  // 遍历旧的，找到修改了的
  Object.keys(oldProps).forEach((key) => {
    if (newProps[key] !== oldProps[key]) {
      isSame = false;
      propsPatchs[key] = newProps[key];
    }
  });

  // 遍历新的，找到新的属性
  Object.keys(newProps).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(oldProps, key)) {
      isSame = false;
      propsPatchs[key] = newProps[key];
    }
  });

  return isSame ? null : propsPatchs;
}


// diff处理两组孩子节点
// 问题，怎么确定两个节点是同一个节点呢，仅仅靠tagname? 目前的做法是这样
// 如果有key且唯一,考虑reorder,remove
// 否则考虑粗暴按序处理
function diffArr(oldArr, newArr, num = 0, patchs = {}) {
  if (oldArr.length === 0) {
    return patchs;
  }
  // const set = new Set(oldArr.map(i => i.key));
  // const hasKey = set.size === oldArr.length;
  const hasKey = false; // 暂且不考虑有key的情况，这里作为优化点
  if (hasKey) { // 有key且唯一
    // REORDER
  } else {
    // 准备处理下一层
    let newOldArr = [];
    let newNewArr = [];
    // 处理当前层
    for (let index = 0; index < oldArr.length; index += 1) {
      const oldItem = oldArr[index];
      const eleKey = num + index + 1;
      // console.log('eleKey',eleKey, oldItem);
      newOldArr = newOldArr.concat(oldItem.children || []);
      if (index > newArr.length - 1) {
        // eslint-disable-next-line
        patchs[eleKey] = { // 删掉当前节点
          type: 'REORDER',
          moves: [
            { index, type: 0 }, // type 0 remove
          ],
        };
      } else {
        const newItem = newArr[index];
        newNewArr = newNewArr.concat(newItem.children || []);
        if (typeof oldItem === 'string') {
          if (typeof newItem === 'string') {
            if (oldItem !== newItem) {
              // eslint-disable-next-line
              patchs[eleKey] = { // TEXT
                type: 'TEXT',
                text: newItem,
              };
            }
          } else {
            // eslint-disable-next-line
            patchs[eleKey] = { // 替换节点
              type: 'REPLACE',
              node: newItem,
            };
          }
        } else if (newItem.tagName !== oldItem.tagName) {
          // console.log('replace',oldItem,newItem)
          // eslint-disable-next-line
          patchs[eleKey] = { // 替换节点
            type: 'REPLACE',
            node: newItem,
          };
        } else {
          // 如果是同一个子节点
          const propsPatchs = diffProps(oldItem, newItem);
          // console.log('propsPatchs',propsPatchs)
          if (propsPatchs) {
            // eslint-disable-next-line
            patchs[eleKey] = {
              type: 'PROPS',
              props: propsPatchs,
            };
          }
        }
      }
    }
    return diffArr(newOldArr, newNewArr, num + oldArr.length, patchs);
  }
  return patchs;
}


// 虚拟dom的diff算法
// 预期返回新旧tree之间的差别
// 平层diff
// 对oldTree的节点标记, root为0, 其孩子节点依次为1,2,3,4
function diff(oldTree, newTree, num = 0, patchs = {}) {
  // 判断节点类型是否一致
  if (oldTree.tagName !== newTree.tagName) {
    // eslint-disable-next-line
    patchs[num] = {
      type: 'REPLACE',
      node: newTree,
    };
  } else {
    const propsPatchs = diffProps(oldTree, newTree);
    if (propsPatchs) {
      // eslint-disable-next-line
      patchs[num] = {
        type: 'PROPS',
        props: propsPatchs,
      };
    }
    // eslint-disable-next-line
    patchs = diffArr(oldTree.children, newTree.children, num, patchs);
  }
  return patchs;
}
