/* eslint-disable no-console */
const { Element, diff, applyDiff } = window.avd;
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
      Element('li', { class: 'item' }, ['Item 4']),
    ]),
  ]);
  return tree;
}

// 新的虚拟节点
function getVirtualDom2() {
  const ulChildren = [
    Element('li', { class: 'item colorRed' }, ['Item 1']),
    Element('li', { class: 'item' }, [
      Element('button', {
        '@click': function clickme() { console.log('u click me'); },
      }, ['click me']),
    ]),

  ];
  // 随机长短(比原来ul的孩子多或者少)
  // 使diff结果多样
  if (Math.random() > 0.5) {
    ulChildren.push(
      Element('li', { class: 'item' }, ['Item 3']),
      Element('li', { class: 'item' }, ['Item 4']),
      Element('li', { class: 'item' }, ['Item 5']),
    );
  }
  // 尝试下
  const newTree = Element('div', { class: 'virtual-container' }, [
    Element('h3', {}, ['Virtual DOM']),
    Element('div', {}, ['after update']),
    Element('ul', { class: 'marginLeft10' }, ulChildren),
  ]);
  globalData.diffResult = null;
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
function renderDom2() {
  globalData.newTree = getVirtualDom2();
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
  globalData.diffResult = diff(globalData.tree, globalData.newTree);
  console.log('diffResult', globalData.diffResult);
}

// 按钮事件: 新旧虚拟节点diff操作
// eslint-disable-next-line
function applyDiffResult(){
  if (!globalData.diffResult) {
    diffDom();
  }
  // 这里操作原来的虚拟dom，应用diff的结果
  applyDiff(globalData.tree, globalData.diffResult);
  // globalData.diffResult = null; // 避免多次应用同一个diffResult
  // const root = document.getElementById('virtualDom');
  // if (root.firstElementChild) {
  //   root.firstElementChild.remove();
  // }
  // // console.log('globalData.tree', globalData.tree);
  // root.appendChild(globalData.tree.render());
}
