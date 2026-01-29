# 手写Promise实现梳理

## 1.Promise核心认知
### 1.核心特性
- 状态不可逆：Promise 仅有 PENDING（等待）、FULFILLED（成功）、REJECTED（失败）三种状态，且仅能从 PENDING 单向转为 FULFILLED 或 REJECTED，状态定型后无法修改。
- 链式调用：then/catch/finally 均返回全新的 Promise 实例，避免原实例状态污染，支持连续调用。
- 异步执行：所有回调函数均通过微任务（queueMicrotask）执行，符合原生执行时序。
- 异常捕获：执行器、回调函数中的同步异常可自动捕获，并通过失败链路传递。
- 值穿透：then未传入成功 / 失败回调时，会将原 Promise 的结果 / 原因原封不动传递给下一个链式调用。

### 2.核心方法分类
- 实例方法：then（核心）、catch（then语法糖）、finally（兜底执行）。
- 静态方法：resolve（快速创建成功Promise）、reject（快速创建失败 Promise）、all（并行执行）、race（竞速执行）。

## 2. 完整代码实现
```js
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
      this.fulfilledLists.map((fn) => queueMicrotask(() => fn(this.value)));
    };
    const reject = (res) => {
      if (this.status !== PromiseIml.PENDING) return;
      this.status = PromiseIml.REJECTED;
      this.reason = res;
      // 调用then回调并且将结果传入回调参数
      this.rejectedLists.map((fn) => queueMicrotask(() => fn(this.reason)));
    };
    try {
      executeFn(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onResolved, onRejected){
    onResolved = typeof onResolved === 'function' ? onResolved : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : (err) => {
        // 用于被catch捕获
        throw err
    }
    const self = this
    const p = new PromiseIml((resolve, reject) => {
        // PEDNING状态时，将处理回调加入存储列表
        console.log(self.status)
        if(self.status === PromiseIml.PENDING){
            self.fulfilledLists.push(() => {
                try {
                    const v = onResolved(self.value)
                    resolve(v)
                } catch (error) {
                    // 将值传递给下一个onRejected
                    reject(error)
                }
            })
            self.rejectedLists.push(() => {
                try {
                    const v = onRejected(self.reason)
                    resolve(v)
                } catch (error) {
                    // 将值传递给下一个onRejected
                    reject(error)
                }
                
            })
        } else if(self.status === PromiseIml.FULFILLED){
            queueMicrotask(() => {
                try {
                    const v = onResolved(self.value)
                    resolve(v)
                } catch (error) {
                    reject(error)
                }
            })
        } else if(self.status === PromiseIml.REJECTED){
            queueMicrotask(() => {
                try {
                    const v = onRejected(self.reason)
                    resolve(v)
                } catch (error) {
                    reject(error)
                }
            })
        }
    })
    return p
  }
  catch(onRejected){
    return this.then(null, onRejected);
  }
  finally(onFinally) {
    onFinally = typeof onFinally === 'function' ? onFinally : () => {};
    return this.then(
    // 原本成功透传value
    (value) => {
        onFinally();
        return value;
    },
    // 原本失败，执行后透传失败原因，throw则用于catch捕获
    (reason) => {
        onFinally();
        throw reason;
    });
  }
  static resolve(value) {
    return new PromiseIml(resolve => resolve(value));
  }
  static reject(reason){
    return new PromiseIml((resolve, reject) => reject(reason));
  }
  static all(arrPromise = []){
    arrPromise = Array.isArray(arrPromise) ? arrPromise : []
    return new PromiseIml((resolve, reject) => {
        if(arrPromise.length === 0){
            return resolve(arrPromise)
        }
        // 存储Promise结果，需要保证原顺序
        const resultArr = [] 
        // 成功promise个数
        let completedCount = 0 
        arrPromise.forEach((item, index) => {
            const p = typeof item.then === 'function' ? item : PromiseIml.resolve(item)
            p.then((res) => {
                resultArr[index] = res
                completedCount++
                if(completedCount === arrPromise.length){
                    resolve(resultArr)
                }
            }).catch((reason) => {
                reject(reason)
            })
        })
    })
  }
  static race(arrPromise = []){
    arrPromise = Array.isArray(arrPromise) ? arrPromise : []
    return new PromiseIml((resolve, reject) => {
        arrPromise.forEach((item) => {
            const p = typeof item.then === 'function' ? item : PromiseIml.resolve(item)
            // 最先有结果的promise完成即立刻返回结果
            p.then(resolve).catch(reject)
        })
    })
  }
}
```