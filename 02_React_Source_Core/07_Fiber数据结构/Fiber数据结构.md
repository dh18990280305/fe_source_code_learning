## Fiber 数据结构 学习实现
### 一、Fiber 核心认知铺垫
1. Fiber 节点本质
- Fiber 是 React 核心的虚拟 DOM 增强版节点，既是承载组件信息（类型、属性、状态）的载体，也是 React 实现可中断 / 可恢复 / 可优先级调度的核心数据结构，替代了传统 React 15 的递归更新栈，让渲染过程可以被切分、暂停。

2. 双链表结构设计目的

Fiber 节点通过 return（父）、child（第一个子）、sibling（下一个兄弟） 三个指针形成单父 + 多子的双链表树结构，核心目的是：

- 支持深度优先的遍历中断与恢复：遍历到某个节点时若有更高优先级任务，可暂停遍历，后续从当前节点继续，无需重新从头开始；
- 降低遍历的空间复杂度：替代递归的调用栈，通过指针遍历实现 O (1) 空间复杂度的树遍历；
- 方便增删改查节点：链表结构对节点的动态操作（如组件更新、卸载）更高效，适配 React 动态渲染的场景。

### 二、Fiber 节点核心属性（分类标注）
按功能将核心属性分为「节点标识」「层级关联」「组件核心信息」「调度控制」「DOM 关联」「更新状态」6 大类，覆盖 React 渲染、调度、更新全流程：

| 分类 | 属性名 | 类型 | 核心作用 |
| ---------- | -------------- | ------------- | -------------- |
| 节点标识 | tag | number | 标记节点类型（函数组件 / 类组件 / 原生 DOM / 根节点等，React 内置枚举）|
| 节点标识 | key | string/number | 同 React 元素 key，用于 diff 算法中节点复用，提升更新效率 |
| 层级关联 | return | Fiber/null | 指向父 Fiber 节点，构成树的向上关联 |
| 层级关联 | child | Fiber/null | 指向第一个子 Fiber 节点，子节点的入口 |
| 层级关联 | sibling | Fiber/null | 指向下一个兄弟 Fiber 节点，兄弟节点通过该指针串联成链表 |
| 组件核心信息 | type | any | 组件类型（原生 DOM 为标签名如 'div'，函数组件为函数本身，类组件为类本身）|
| 组件核心信息 | props | Record<string, any> | 组件接收的属性，与 React 元素 props 一致 |
| 调度控制 | priorityLevel | number | 节点更新的优先级，React 根据优先级决定遍历 / 更新的顺序（高优先级先执行）|
| 调度控制 | expirationTime | number | 节点更新的过期时间，超过该时间则强制执行，防止低优先级任务阻塞 |
| DOM 关联 | stateNode | any | 指向真实 DOM 节点（原生 DOM 节点）/ 组件实例（类组件）/ 根容器（根 Fiber）|
| 更新状态 | memoizedState | any | 节点的缓存状态（函数组件的 hooks 状态、类组件的 this.state、原生 DOM 无）|
| 更新状态 | pendingProps | Record<string, any> | 待处理的新 props，更新阶段会替换为memoizedProps|
| 更新状态 | memoizedProps | Record<string, any> | 缓存的旧 props，用于 diff 算法对比 props 变化 |

### 三、核心代码说明与使用要点

1. 双链表结构实现关键
- 父节点 → 子节点：通过 child 指向第一个子节点，其余子节点通过「子节点的 sibling」串联；
- 子节点 → 父节点：所有子节点通过 return 直接指向父节点，无需遍历；
- 兄弟节点互访：通过 sibling 指针依次访问，最后一个兄弟节点的 sibling 为 null。

2. 关键属性与 React 执行流程的关联
- pendingProps / memoizedProps：更新阶段 React 会将新 props 存入pendingProps，对比memoizedProps（旧 props）判断是否需要更新；
- memoizedState：函数组件的 hooks 链表、类组件的this.state都会缓存到该属性，保证组件状态的持久化；
- priorityLevel / expirationTime：React 调度器（Scheduler）会根据这两个属性，优先处理高优先级、即将过期的 Fiber 节点，实现可中断渲染；
- stateNode：是 Fiber 节点与真实 DOM 的唯一连接，渲染阶段会通过该属性将虚拟 DOM 的变化映射到真实 DOM。