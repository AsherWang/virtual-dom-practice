const {
  KElement: El, KComponent,
} = window.avd;

class MyButton extends KComponent {
  render() {
    const { text, onClick } = this.props;
    return El('button', {
      '@click': onClick,
    }, [text]);
  }
}

class MyApp extends KComponent {
  constructor() {
    super();
    this.state = {
      name: 'soulwriter',
      count: 0,
    };
  }

  onBtnClick() {
    this.setState({
      count: this.state.count + 1,
    });
  }

  render() {
    const { name, count } = this.state;
    const ulChildren = [
      El('li', { class: 'item' }, [name]),
      El('li', { class: 'item' }, [`button clicked: ${count}`]),
      El('li', { class: 'item' }, [
        new MyButton({
          text: 'click me',
          onClick: this.onBtnClick.bind(this),
        }),
      ]),
    ];
    return El('div', { class: 'virtual-container' }, [
      El('h3', {}, ['VIRTUAL DOM']),
      El('ul', { class: 'marginLeft10' }, ulChildren),
    ]);
  }
}


window.onload = () => {
  const app = document.getElementById('app');
  new MyApp().mount(app);
};
