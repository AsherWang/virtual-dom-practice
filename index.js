
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
            count += child.count
        }
        count++;
    });
    this.count = count; // count的意思是，嗯此节点孩子节点等等总节点数
}

// 脑补的
function setAttr(el, name, value) {
    el.setAttribute(name, value);
}

// 预期返回结果是一个HTML DOM节点对象
// 如果children有内容，按顺序将child渲染并添加到父节点内部
Element.prototype.render = function () {
    const el = document.createElement(this.tagName);
    const props = this.props;
    for (const propName in props) {
        setAttr(el, propName, props[propName]);
    }
    this.children.forEach((child) => {
        const childEl = (child instanceof Element) ? child.render() : document.createTextNode(child);
        el.appendChild(childEl);
    });

    return el;
}



function getVirtualDom(){
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
function getNewVirtualDom(){
    // 尝试下
    const newTree = Element('div', { class: 'virtual-container' }, [
        Element('h3', {}, ['Virtual DOM']),
        Element('div', {}, ['after update']),
        Element('ul', { class: 'marginLeft10'}, [
            Element('li', { class: 'item' }, ['Item 1']),
            // Element('li', { class: 'item' }, ['Item 2']),
            Element('li', { class: 'item' }, ['Item 3']),
        ]),
    ]);
    return newTree;
}


// 预期返回两个节点的变化了的属性
function diffProps(oldNode, newNode){
    const oldProps = oldNode.props;
    const newProps = newNode.props;


    // console.log('oldProps',oldProps)
    // console.log('newProps',newProps)

    let key;
    const propsPatchs = {};
    let isSame = true;

    // 遍历旧的，找到修改了的
    for(key in oldProps){
        if(newProps[key] !== oldProps[key]){
            isSame = false;
            propsPatchs[key]=newProps[key];
        }
    }

    // 遍历新的，找到新的属性
    for(key in newProps){
        if(!oldProps.hasOwnProperty(key)){
            isSame = false;
            propsPatchs[key]=newProps[key];
        }
    }

    return isSame ? null : propsPatchs;
}


// 虚拟dom的diff算法
// 预期返回新旧tree之间的差别
// 平层diff
// 对oldTree的节点标记, root为0, 其孩子节点依次为1,2,3,4
function diff(oldTree, newTree, num = 0,patchs = {}){
    // 判断节点类型是否一致
    if(oldTree.tagName !== newTree.tagName){
        patchs[num] = {
            type: 'REPLACE',
            node: newTree
        }
    } else {
        const propsPatchs = diffProps(oldTree,newTree);
        if(propsPatchs){
            patchs[num] = {
                type: 'PROPS',
                props: propsPatchs
            }
        }
        patchs = diffArr(oldTree.children,newTree.children,num,patchs); 
    }
    return patchs;
}

// diff处理两组孩子节点
// 问题，怎么确定两个节点是同一个节点呢，仅仅靠tagname? 目前的做法是这样
// 如果有key且唯一,考虑reorder,remove
// 否则考虑粗暴按序处理
function diffArr(oldArr,newArr, num = 0, patchs = {}){
    if(oldArr.length === 0){
        return patchs;
    }
    // const set = new Set(oldArr.map(i => i.key));
    // const hasKey = set.size === oldArr.length;
    const hasKey = false; // 暂且不考虑有key的情况，这里作为优化点
    if(hasKey){ // 有key且唯一
        // REORDER
    } else {
        // 准备处理下一层
        let newOldArr = [];
        let newNewArr = [];
        // 处理当前层
        for(let index = 0; index < oldArr.length; index += 1){
            let oldItem = oldArr[index];
            const eleKey = num+index+1;
            // console.log('eleKey',eleKey, oldItem);
            newOldArr= newOldArr.concat(oldItem.children || []);
            if(index > newArr.length -1){
                patchs[eleKey]={ // 删掉当前节点
                    type: 'REORDER',
                    moves: [
                        {index: index, type: 0} // type 0 remove
                    ]
                }
            }else{
                let newItem = newArr[index];
                newNewArr= newNewArr.concat(newItem.children || []);
                if(typeof oldItem === 'string'){
                    if(typeof newItem === 'string'){
                        if(oldItem !== newItem){
                            patchs[eleKey] = { // TEXT
                                type: 'TEXT',
                                text: newItem
                            }
                        }
                    }else{
                        patchs[eleKey] = { // 替换节点
                            type: 'REPLACE',
                            node: newItem
                        }
                    }
                }else if(newItem.tagName !== oldItem.tagName){
                    // console.log('replace',oldItem,newItem)
                    patchs[eleKey] = { // 替换节点
                        type: 'REPLACE',
                        node: newItem
                    }
                }else{
                    // 如果是同一个子节点
                    const propsPatchs = diffProps(oldItem,newItem);
                    // console.log('propsPatchs',propsPatchs)
                    if(propsPatchs){
                        patchs[eleKey] = {
                            type: 'PROPS',
                            props: propsPatchs
                        }
                    }
                }
            }
        }
        return diffArr(newOldArr, newNewArr, num + oldArr.length, patchs)
    }
}


function diffWithOldTree(){
    return diff(globalData.tree, globalData.newTree)
}

let globalData = {
    tree: null
}

function renderDom(){
    globalData.tree = getVirtualDom();
    document.getElementById('virtualDom').appendChild(globalData.tree.render());
}
function renderNewDom(){
    globalData.newTree = getNewVirtualDom();
    document.getElementById('newVirtualDom').appendChild(globalData.newTree.render());
}

function diffDom(){
    const diffResult = diffWithOldTree();
    console.log('diffResult', diffResult);
}