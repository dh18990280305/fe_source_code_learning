interface FiberNode {
    tag: number; // 组件类型 0：根组件 1.原生dom  2.函数组件 5.类组件
    key: string | number | null; // diff 用的key
    memoizedState: any; // 缓存组件状态 this.state / hooks
    return: FiberNode | null; // 指向父节点
    child: FiberNode | null; // 第一个子节点(子节点入口)
    sibling: FiberNode | null; //指向下一个兄弟节点
    props: Record<string, any>; // 组件接收的props
    pendingProps: Record<string, unknown>; // 代处理的props存放
    memoizedProps: Record<string, unknown> | null; // 缓存的旧props
    priorityLevel: number; // 节点更新优先级，决定加入更新队列位置
    expirationTime: number; // 过期时间(时间戳)，到期立即执行
    stateNode: any; // 真实DOM/组件实例/根容器（如：div元素 | 类组件this | root）
}

class CreateFiberNode implements FiberNode{
     // 1. 节点标识：区分节点类型、唯一标识
  tag: number; // 节点类型枚举（如：0-根节点、1-原生DOM、2-函数组件、5-类组件）
  key: string | number | null; // diff 用key，可选

  // 2. 层级关联：双链表核心指针，形成 Fiber 树
  return: FiberNode | null; // 父节点（指向父Fiber）
  child: FiberNode | null; // 第一个子节点（子节点入口）
  sibling: FiberNode | null; // 下一个兄弟节点（兄弟节点串联）

  // 3. 组件核心信息：与组件本身强相关
  type: any; // 组件类型（div/span | 函数组件 | 类组件）
  props: Record<string, any>; // 组件接收的props

  // 4. 调度控制：React 可中断调度的核心属性
  priorityLevel: number; // 优先级级别（数值越大优先级越高）
  expirationTime: number; // 过期时间（时间戳，超过则强制执行）

  // 5. DOM 关联：连接虚拟DOM与真实DOM
  stateNode: any; // 真实DOM/组件实例/根容器（如：div元素 | 类组件this | root）

  // 6. 更新状态：缓存旧状态，用于diff和状态恢复
  memoizedState: any; // 函数组件的 hooks 链表、类组件的this.state都会缓存到该属性，保证组件状态的持久化；
  pendingProps: Record<string, any>; // 待更新的新props
  memoizedProps: Record<string, any> | null; // 缓存的旧props（初始为null）
    constructor(tag: number, type: any, props: Record<string, any>, key: string | number | null = null){
        this.tag = tag;
        this.key = key;

        // 双链表指针初始化：初始无父、无子、无兄弟
        this.return = null;
        this.child = null;
        this.sibling = null;

        // 组件信息初始化
        this.type = type;
        this.props = props;

        // 调度属性初始化：默认中等优先级、无过期时间
        this.priorityLevel = 3; // 1-最高 2-高 3-中 4-低 5-最低
        this.expirationTime = 0; // 0 表示无过期时间

        // DOM 关联初始化：初始无真实节点/实例
        this.stateNode = null;

        // 更新状态初始化：待更新props=当前props，旧状态初始为null
        this.memoizedState = null;
        this.pendingProps = props; // 初始待更新props为传入的props
        this.memoizedProps = null;
    }
}

const divFiber = new CreateFiberNode(
  1, // tag=1 表示原生DOM节点
  'div', // type=标签名
  { className: 'container', children: 'Hello Fiber' }, // props
  'container-key' // key
);

// 给divFiber添加子节点（span）
const spanFiber = new CreateFiberNode(1, 'span', { children: 'Fiber 节点' }, 'span-key');
spanFiber.return = divFiber; // 子节点的父节点指向divFiber
divFiber.child = spanFiber; // divFiber的第一个子节点是spanFiber
