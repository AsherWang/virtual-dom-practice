# virtual-dom-practice
听说不了解virtual-dom原理不太好 `¬_¬`

# demo
[简单demo](https://asherwang.github.io/virtual-dom-practice/demo) 配合控制台食用

# demo2
[自定义组件](https://asherwang.github.io/virtual-dom-practice/demo/index2.html)  
[主要代码](https://github.com/AsherWang/virtual-dom-practice/blob/master/demo/demo.js)

# feature
- 实现Element类(基本照搬参考博文), 可以用于构建虚拟dom树
- 实现diff方法，接受两个不同的虚拟dom，返回diff结果
- 实现applyDiff方法，将diff结果应用到原虚拟dom
- demo展示了diff虚拟DOM1和虚拟DOM2，并将diff结果应用到虚拟DOM1的过程
- demo2展示自定义组件的用法

# todo  
- 强行脑补和使用diff中REORDER类型,嗯不太好
- 想想再说

## references
- [简书-vue核心之虚拟DOM(vdom)](https://www.jianshu.com/p/af0b398602bc)
