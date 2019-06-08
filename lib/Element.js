function Element(tagName, props, children) {
  // 让Element(...) 和 new Element(...)有一样的行为
  if (!(this instanceof Element)) {
    return new Element(tagName, props, children);
  }

  this.tagName = tagName;
  this.props = props || {};
  this.children = children || [];
  this.key = props ? props.key : undefined;

  let count = 0;
  this.children.forEach((child) => {
    if (child instanceof Element) {
      count += child.count;
    }
    count += 1;
  });
  this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
}

// 脑补的
function setAttr(el, name, value) {
  el.setAttribute(name, value);
}

// 预期返回结果是一个HTML DOM节点对象
// 如果children有内容，按顺序将child渲染并添加到父节点内部
Element.prototype.render = function render() {
  const el = document.createElement(this.tagName);
  const { props } = this;
  Object.keys(props).forEach((propName) => {
    setAttr(el, propName, props[propName]);
  });
  this.children.forEach((child) => {
    const childEl = (child instanceof Element) ? child.render() : document.createTextNode(child);
    el.appendChild(childEl);
  });

  return el;
};
