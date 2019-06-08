/* eslint-disable no-console */
const { Element, diff } = window.avd;
const globalData = {
  tree: null,
};

// 虚拟节点
function getVirtualDom() {
  // 尝试下
  const tree = Element('div', { class: 'virtual-container' }, [
    Element('p', {}, ['Virtual DOM']),
    Element('div', {}, ['before update']),
    Element('ul', {}, [
      Element('li', { class: 'item' }, ['Item 1']),
      Element('li', { class: 'item' }, ['Item 2']),
      Element('li', { class: 'item' }, ['Item 3']),
    ]),
  ]);
  return tree;
}

// 新的虚拟节点
function getNewVirtualDom() {
  // 尝试下
  const newTree = Element('div', { class: 'virtual-container' }, [
    Element('h3', {}, ['Virtual DOM']),
    Element('div', {}, ['after update']),
    Element('ul', { class: 'marginLeft10' }, [
      Element('li', { class: 'item' }, ['Item 1']),
      // Element('li', { class: 'item' }, ['Item 2']),
      Element('li', { class: 'item' }, ['Item 3']),
    ]),
  ]);
  return newTree;
}

// 按钮事件: 渲染虚拟节点
// eslint-disable-next-line
function renderDom() {
  globalData.tree = getVirtualDom();
  const root = document.getElementById('virtualDom');
  if (root.firstElementChild) {
    root.firstElementChild.remove();
  }
  root.appendChild(globalData.tree.render());
}

// 按钮事件: 渲染新的虚拟节点
// eslint-disable-next-line
function renderNewDom() {
  globalData.newTree = getNewVirtualDom();
  const root = document.getElementById('newVirtualDom');
  if (root.firstElementChild) {
    root.firstElementChild.remove();
  }
  root.appendChild(globalData.newTree.render());
}

// 按钮事件: 新旧虚拟节点diff操作
// eslint-disable-next-line
function diffDom() {
  if (!globalData.tree || !globalData.newTree) {
    // eslint-disable-next-line
    alert('先渲染新旧虚拟节点');
    return;
  }
  const diffResult = diff(globalData.tree, globalData.newTree);
  console.log('diffResult', diffResult);
}
