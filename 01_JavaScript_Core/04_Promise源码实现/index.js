class PromiseIml {
  static PENDING = "PENDING";
  static FULFILLED = "FULFILLED";
  static REJECTED = "REJECTED";
  constructor(executeFn) {
    // 状态 - 不可逆
    this.status = PromiseIml.PENDING;
    // resolve值
    this.value = null;
    // reject值
    this.reason = null;
    // 存储resolve回调函数，在状态改变为FULFILLED调用
    this.fulfilledLists = [];
    // 存储reject回调函数，在状态改变为REJECTED调用
    this.rejectedLists = [];
    const resolve = (res) => {
      if (this.status !== PromiseIml.PENDING) return;
      this.status = PromiseIml.FULFILLED;
      this.value = res;
      // 调用then回调并且将结果传入回调参数
      this.fulfilledLists.map((fn) => fn(this.value));
    };
    const reject = (res) => {
      if (this.status !== PromiseIml.PENDING) return;
      this.status = PromiseIml.REJECTED;
      this.reason = res;
      // 调用then回调并且将结果传入回调参数
      this.fulfilledLists.map((fn) => fn(this.value));
    };
    try {
      executeFn(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(resloveFn){
    // if()
  }
}

new PromiseIml((resolve, reject) => {
  setTimeout(() => {
    resolve("test resolve");
  }, 1200);
}).then((res) => {
  console.log('res', res)
})
