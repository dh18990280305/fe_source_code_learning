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

new PromiseIml((resolve, reject) => {
  reject("test reject");
}).then((res) => {
  console.log('res: ', res)
  return 11111
}).then((res2) => {
    console.log('res2: ', res2)
}).then((res3) => {
    console.log('res3: ', res3)
}).catch((err) => {
    console.log('err: ', err)
}).finally(() => {
    console.log('finallyfinallyfinally')
})

const p1 = new PromiseIml((resolve, reject) => {
    setTimeout(() => {
        resolve("test resolve111");
    }, 1200);
})

const p2 = new PromiseIml((resolve, reject) => {
    setTimeout(() => {
        reject("test reject1111");
    }, 800);
})

const res = PromiseIml.race([p1, p2]).then((resArr) => {
    console.log('resArr,', resArr)
}).catch((err) => {
    console.log('resArr-err,', err)
})