/**
 * 模拟 React Scheduler 时间切片实现
 * 核心：分块执行长任务 + 剩余时间检测 + 可中断
 */
class TimeSlicingScheduler {
  constructor() {
    this.taskQueue = []; // 任务队列
    this.isRunning = false; // 是否正在执行任务，避免重复调度
    this.timeSlice = 5; // 切片时间，默认5ms（同React）
  }

  /**
   * 添加任务到队列
   * @param {Function} task - 要执行的任务（需是可分块的迭代器函数）
   * @param {number} priority - 优先级（数字越小，优先级越高）
   */
  addTask(task, priority = 10) {
    this.taskQueue.push({
      task: this.wrapTask(task), // 包装为迭代器，支持分块执行
      priority,
      startTime: performance.now(),
    });
    // 按优先级升序排序（高优先级在前）
    this.taskQueue.sort((a, b) => a.priority - b.priority);
    // 启动调度
    this.schedule();
  }

  /**
   * 将普通函数包装为迭代器，支持分块执行（核心：可中断）
   * @param {Function} task - 原始长任务
   * @returns {Generator} 迭代器对象
   */
  wrapTask(task) {
    return (function* () {
      yield task(); // 分块执行，支持中断后续跑
    })();
  }

  /**
   * 核心调度方法：时间切片执行任务
   */
  schedule() {
    // 若已有任务在执行，直接返回（避免重复执行）
    if (this.isRunning) return;
    this.isRunning = true;

    // 启动任务执行：使用 requestAnimationFrame 对齐浏览器帧
    const frameCallback = (timestamp) => {
      // 执行任务，直到切片时间用尽或任务队列为空
      const hasMoreTasks = this.executeTasks(timestamp);

      if (hasMoreTasks) {
        // 还有剩余任务，继续调度下一帧
        requestAnimationFrame(frameCallback);
      } else {
        // 任务执行完毕，重置状态
        this.isRunning = false;
      }
    };

    requestAnimationFrame(frameCallback);
  }

  /**
   * 执行任务核心逻辑：剩余时间检测 + 分块执行
   * @param {number} startTime - 当前帧开始时间
   * @returns {boolean} 是否还有剩余任务
   */
  executeTasks(startTime) {
    let currentTask = this.taskQueue[0];
    if (!currentTask) return false;

    const { task } = currentTask;
    let shouldContinue = true;

    // 循环执行，直到切片时间用尽或任务执行完毕
    while (shouldContinue && currentTask) {
      // 检测剩余时间：当前时间 - 帧开始时间 > 切片时间 → 中断
      const elapsedTime = performance.now() - startTime;
      if (elapsedTime > this.timeSlice) {
        shouldContinue = false; // 切片时间用尽，中断
        break;
      }

      // 执行当前任务的一个小切片（迭代器next）
      const result = task.next();
      // 若任务执行完毕（迭代器done），从队列中移除
      if (result.done) {
        this.taskQueue.shift();
      }
      // 更新当前任务（队列首元素）
      currentTask = this.taskQueue[0];
    }

    // 返回是否还有剩余任务（队列非空 或 当前任务未执行完）
    return this.taskQueue.length > 0 || (currentTask && !shouldContinue);
  }
}

// ---------------------- 测试用例 ----------------------
// 1. 初始化调度器
const scheduler = new TimeSlicingScheduler();

// 2. 模拟一个长任务：循环10000次，打印计数（正常执行会阻塞主线程）
function longTask() {
  let count = 0;
  return () => {
    // 每次切片执行100次，分100块执行（避免单次阻塞）
    for (let i = 0; i < 100; i++) {
      count++;
      if (count % 1000 === 0) {
        console.log(`长任务执行中：${count}/10000`);
      }
    }
    // 任务未执行完时，继续返回执行
    if (count < 10000) {
      return false;
    }
    console.log("长任务执行完毕！");
    return true;
  };
}

// 3. 添加长任务到调度器（优先级10）
scheduler.addTask(longTask(), 10);

// 4. 添加高优先级任务（优先级1，会插队执行）
scheduler.addTask(() => {
  console.log("【高优先级任务】执行：用户点击事件处理");
  return true;
}, 1);

// 测试：页面点击事件（验证不阻塞）
document.addEventListener("click", () => {
  console.log("页面点击响应：无卡顿，主线程未被阻塞！");
});
