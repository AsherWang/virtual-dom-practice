function Element(tagName, props, children) {
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

  let count = 0;
  this.children.forEach((child, index) => {
    if (child instanceof Element) {
      count += child.count;
    } else {
      const textNode = new Element();
      textNode.isText = true;
      textNode.text = child;
      this.children[index] = textNode;
    }
    count += 1;
  });
  this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
}

// 脑补的
function setAttr(el, name, value) {
  if (typeof value === 'function' && name.startsWith('@')) {
    // 绑定事件
    const evtName = name.slice(1);
    // 可能需要判断是不是原生事件之类的，这里还没有自定义组件所以只有原生事件
    // el.removeEventListener(evtName); // 移除所有的原绑定事件，嗯。。。
    el.addEventListener(evtName, value);
  } else {
    el.setAttribute(name, value);
  }
}

// 预期返回结果是一个HTML DOM节点对象
// 如果children有内容，按顺序将child渲染并添加到父节点内部
Element.prototype.render = function render() {
  if (this.isText) {
    return document.createTextNode(this.text);
  }
  const el = document.createElement(this.tagName);
  const { props } = this;
  Object.keys(props).forEach((propName) => {
    setAttr(el, propName, props[propName]);
  });
  this.children.forEach((child) => {
    const childEl = child.render();
    el.appendChild(childEl);
  });
  this.$el = el;
  return el;
};

Element.prototype.setAttr = function eSetAttr(name, value) {
  setAttr(this.$el, name, value);
};
