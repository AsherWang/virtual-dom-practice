/* eslint-disable no-undef */
// 自定义组件
class _Component {
  constructor(props) {
    this.state = {
    };
    this.props = props;
    this.preRendered = null;
  }

  // may partly update
  setState(newState) {
    Object.assign(this.state, newState);
    const result = diff(this.preRendered, this.render());
    applyDiff(this.preRendered, result);
  }

  // mount rendered content to el
  // mount just called once
  mount(el) {
    if (el.firstElementChild) {
      el.firstElementChild.remove();
    }
    this.preRendered = this.render();
    if (this.preRendered) {
      el.appendChild(this.preRendered.render());
    }
  }

  // override this
  render() {
    return null;
  }
}

// 使得Element()和new Element()效果一样
// eslint-disable-next-line no-unused-vars
const KComponent = new Proxy(_Component, {
  apply(target, thisArg, argumentsList) {
    // eslint-disable-next-line
    return new target(...argumentsList);
  },
});
