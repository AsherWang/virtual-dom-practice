class _Element {
  constructor(tagName, props, children) {
    this.tagName = tagName; // 对应的dom节点标签
    this.props = props || {}; // 属性
    this.children = children || []; // 孩子节点
    this.key = props ? props.key : undefined; // 备用，diff使用，目前还没用到
    this.isText = false; // 是否是纯文本节点
    this.text = ''; // 如果是纯文本节点，text存入文本内容
    // init
    let count = 0;
    this.children.forEach((child, index) => {
      if (child instanceof _Element) {
        count += child.count;
      } else {
        const textNode = new _Element();
        textNode.isText = true;
        textNode.text = child;
        this.children[index] = textNode;
      }
      count += 1;
    });
    this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
  }

  // 预期返回结果是一个HTML DOM节点对象
  // 如果children有内容，按顺序将child渲染并添加到父节点内部
  render() {
    if (this.isText) {
      return document.createTextNode(this.text);
    }
    const el = document.createElement(this.tagName);
    this.$el = el;
    const { props } = this;
    Object.keys(props).forEach((propName) => {
      this.setAttr(propName, props[propName]);
    });
    this.children.forEach((child) => {
      const childEl = child.render();
      el.appendChild(childEl);
    });
    return el;
  }

  // 设置当$el的属性
  setAttr(name, value) {
    if (typeof value === 'function' && name.startsWith('@')) {
      // 绑定事件
      const evtName = name.slice(1);
      // 可能需要判断是不是原生事件之类的，这里还没有自定义组件所以只有原生事件
      // el.removeEventListener(evtName); // 移除所有的原绑定事件，嗯。。。
      this.$el.addEventListener(evtName, value);
    } else {
      this.$el.setAttribute(name, value);
    }
  }
}

// 使得Element()和new Element()效果一样
// eslint-disable-next-line no-unused-vars
const Element = new Proxy(_Element, {
  apply(target, thisArg, argumentsList) {
    // eslint-disable-next-line
    return new target(...argumentsList);
  },
});
