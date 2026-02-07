// 模拟 React 内部存储 Hooks 的容器
let hooks = [];
// 记录当前执行到第几个 Hook
let currentHookIndex = 0;

function useState(initialState){
    const currentIndex = currentHookIndex
    hooks[currentIndex] = hooks[currentIndex] || initialState
    console.log('currentIndex',hooks[currentIndex],currentIndex)

    const setState = (newValue) => {
        if(typeof newValue === 'function'){
            hooks[currentIndex] = newValue(hooks[currentIndex])
        }else {
            hooks[currentIndex] = newValue
        }
        renderComponent()
    }
    currentHookIndex++
    return [hooks[currentIndex], setState]
}

// 每次渲染前重置索引
function renderComponent(component) {
    // 每次渲染组件前，重置 Hook 索引为 0
    currentHookIndex = 0;
    // 模拟组件rerender，在39行打印能取到更新后的值。实际上react的更新还包括了批量更新操作
    // TestComponent();
}

function TestComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('initValue');

  // 模拟点击事件更新状态
  setTimeout(() => {
    setCount(10)
    setName('test-setState')
    console.log('update---------', count, name)
  }, 1000);
}

// 执行组件（模拟首次渲染）
TestComponent();