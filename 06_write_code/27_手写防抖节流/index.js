const Debounce = (callback, delay) => {
  callback = typeof callback === 'function' ? callback : () => {}
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback.call(this, ...args)
      timer = null
    }, delay)
  }
}

// leading指定调用在节流开始前执行一次
// trailing指定调用在节流结束后再执行一次
const Throttle = (callback, delay, options = { leading: false, trailing: false }) => {
  callback = typeof callback === 'function' ? callback : () => {}
  let { leading, trailing } = options
  let lastExecTime = 0
  let timer = null
  return function (...args){
    let currentTime = Date.now()
    if (lastExecTime === 0 && !leading) {
      lastExecTime = currentTime;
    }
    const remainingTime = delay - (currentTime - lastExecTime);
    if(remainingTime <= 0){
      if(timer){
        clearTimeout(timer)
        timer = null
      }
      callback.call(this, ...args)
      lastExecTime = currentTime
    } else if(trailing && !timer){
      timer = setTimeout(() => {
        // 执行 trailing 回调
        callback.apply(this, args);
        // 重置变量：更新执行时间 + 清空定时器
        lastExecTime = leading ? Date.now() : 0; // leading 为 true 时，下次触发从此时开始算
        timer = null;
      }, remainingTime);
    }
  }
} 

window.addEventListener('scroll', Throttle((e) => {
  console.log('e')
}, 2000, {
  leading: true,
  trailing: true
}))