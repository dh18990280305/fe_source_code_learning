// 扩展 Hooks 容器：存储 useEffect 的依赖和回调
let hooks = [];
let currentHookIndex = 0;
// 存储 useEffect 的依赖（用于对比）
let effectDeps = [];

/**
 * 简化版 useEffect
 * @param {Function} callback 副作用回调
 * @param {Array} deps 依赖数组
 */
function useEffect(callback, deps) {
    const currentIndex = currentHookIndex;
    // 获取上一次的依赖
    const prevDeps = effectDeps[currentIndex];
    // 判断是否需要执行回调：依赖不存在 / 依赖有变化
    const hasChanged = !prevDeps || !deps.every((dep, i) => dep === prevDeps[i]);

    if (hasChanged) {
        // 执行清理函数（上一次的回调返回值）
        const cleanUp = hooks[currentIndex];
        if (cleanUp && typeof cleanUp === 'function') {
            cleanUp();
        }
        // 模拟 useEffect 异步执行（浏览器渲染完成后）
        setTimeout(() => {
            // 保存清理函数到 hooks 数组
            hooks[currentIndex] = callback();
        });
        // 更新当前依赖
        effectDeps[currentIndex] = deps;
    }

    currentHookIndex++;
}

// 复用之前的 renderComponent 函数
function renderComponent(component) {
    currentHookIndex = 0;
    // component();
}

// 测试用例
function TestComponent() {
    const [count, setCount] = useState(0);

    // 模拟监听副作用
    useEffect(() => {
        console.log('副作用执行：count =', count);
        // 清理函数
        return () => {
            console.log('清理副作用：count =', count);
        };
    }, [count]); // 依赖 count，仅当 count 变化时执行

    // 模拟更新
    setTimeout(() => {
        setCount(1);
    }, 1000);
}

// 首次渲染
renderComponent(TestComponent);