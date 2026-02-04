/**
 * React 调和阶段核心遍历方法（深度优先）
 * @param {Fiber} currentFiber - 旧Fiber节点（更新阶段）/null（首屏渲染）
 * @param {VNode} pendingVNode - 新虚拟DOM节点
 * @param {number} expirationTime - 任务过期时间（Scheduler 优先级）
 * @returns {Fiber} 处理后的新Fiber节点
 */
function reconcileFiber(currentFiber, pendingVNode, expirationTime) {
  // 1. 执行 beginWork：递阶段 - 构建/更新Fiber + Diff逻辑
  const nextFiber = beginWork(currentFiber, pendingVNode, expirationTime);

  // 2. 深度优先遍历：若有子Fiber，递归处理子节点（继续递阶段）
  if (nextFiber.child) {
    reconcileFiber(null, nextFiber.child.pendingVNode, expirationTime);
  }

  // 3. 执行 completeWork：归阶段 - 生成DOM + 收集副作用
  completeWork(nextFiber);

  return nextFiber;
}

/**
 * beginWork 核心方法：递阶段 - Fiber构建/Diff/子树生成
 * @param {Fiber} current - 旧Fiber（update）/null（mount）
 * @param {VNode} vnode - 新虚拟DOM
 * @param {number} expirationTime - 优先级过期时间
 * @returns {Fiber} 新/更新后的Fiber节点
 */
function beginWork(current, vnode, expirationTime) {
  let nextFiber;
  const { type, props } = vnode;

  // 核心职责1：判断更新类型 - 首屏(mount) / 更新(update)
  const isMount = !current;

  if (isMount) {
    // 首屏渲染：核心职责2 - 创建全新Fiber节点
    nextFiber = createFiber(vnode, expirationTime);
  } else {
    // 更新阶段：核心职责3 - 执行Diff算法，复用/更新旧Fiber
    nextFiber = reconcileUpdate(current, vnode, expirationTime);
  }

  // 核心职责4：构建子Fiber树 - 生成子节点Fiber，建立父子关联
  nextFiber.child = createChildFibers(nextFiber, props.children, expirationTime);

  // 核心职责5：优先级判断 - 若有更高优先级任务，标记中断
  if (shouldYield(expirationTime)) {
    markWorkInProgress(nextFiber); // 标记为进行中，后续可恢复
  }

  return nextFiber;
}

/**
 * completeWork 核心方法：归阶段 - DOM生成/副作用收集/属性处理
 * @param {Fiber} fiber - 已完成beginWork的Fiber节点
 */
function completeWork(fiber) {
  const { type, props, stateNode } = fiber;
  const isHostComponent = isHostDOMType(type); // 是否为原生DOM组件（div/span等）

  // 核心职责1：原生DOM组件 - 生成/更新真实DOM节点
  if (isHostComponent) {
    if (!stateNode) {
      // 首屏：创建真实DOM，挂载到Fiber的stateNode（Fiber-DOM映射）
      fiber.stateNode = createDOMElement(type, props);
    } else {
      // 更新：执行DOM属性Diff，更新已有DOM（避免全量替换）
      updateDOMAttributes(stateNode, props);
    }
    // 核心职责2：将子DOM节点挂载到当前父DOM（归阶段向上，子DOM已生成）
    appendChildDOM(fiber.stateNode, fiber.child?.stateNode);
  }

  // 核心职责3：处理组件上下文/属性透传（类组件/Context）
  propagateContext(fiber);
  resolveProps(fiber);

  // 核心职责4：收集副作用 - 根据Fiber状态标记对应的Effect（DOM增/删/改/生命周期等）
  if (hasSideEffect(fiber)) {
    collectEffect(fiber, fiber.effectTag); // 加入全局副作用队列
  }

  // 核心职责5：Fiber收尾 - 合并子Fiber的副作用，向上传递
  if (fiber.sibling) {
    fiber.return.effects = mergeEffects(fiber.return.effects, fiber.effects);
  }
}

// 辅助方法：判断是否为原生DOM类型组件
function isHostDOMType(type) {
  return typeof type === 'string' && ['div', 'span', 'p', 'input'].includes(type);
}
// 辅助方法：判断是否需要中断（Scheduler 时间切片/高优先级抢占）
function shouldYield(expirationTime) {
  return performance.now() >= expirationTime || hasHigherPriorityWork();
}