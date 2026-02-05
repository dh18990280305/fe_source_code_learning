// 1. dispatchAction 入口（ReactFiberClassComponent.js）
function dispatchAction(fiber, queue, action) {
  // 创建 Update 对象
  const update = {
    action,
    lane: requestUpdateLane(fiber), // 优先级
    next: null,
  };

  // 将 Update 加入队列
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // 调度更新
  scheduleUpdateOnFiber(fiber, update.lane);
}

// 2. 调度更新（ReactFiberWorkLoop.js）
function scheduleUpdateOnFiber(fiber, lane) {
  // 标记更新优先级
  markUpdateLaneFromFiberToRoot(fiber, lane);
  // 判断是否批量更新（核心：batchedUpdates 标记）
  if (isBatchingUpdates) {
    // 批量更新：暂存更新，不立即执行
    if (isUnbatchingUpdates) {
      flushSyncCallbacks(); // 非批量模式下立即执行
    }
    return;
  }

  // 非批量更新：立即调度
  const root = getRootForFiber(fiber);
  scheduleCallback(lanesToEventPriority(lane), () => {
    performSyncWorkOnRoot(root); // 执行同步更新
  });
}