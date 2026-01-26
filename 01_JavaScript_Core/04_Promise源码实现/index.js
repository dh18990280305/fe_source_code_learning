class MyPromise {
  constructor(fn) {
    this.status = "PENDING";
    this.fulfilledFns = new Set();
    this.rejectedFns = new Set();
    const resolve = (value) => {
      this.status = "FULFILLED";
      this.value = value;
      if (this.fulfilledFns.size > 0) {
        for (let fn of this.fulfilledFns) {
          queueMicrotask(() => fn(this.value));
        }
      }
    };
    const reject = (reason) => {
      this.status = "REJECTED";
      this.reason = reason;
      if (this.rejectedFns.size > 0) {
        for (let fn of this.rejectedFns) {
          queueMicrotask(() => fn(this.value));
        }
      }
    };
    fn(resolve, reject);
  }
  then(onFulfilled) {
    if (this.status === "PENDING") {
      this.fulfilledFns.add(onFulfilled);
    }
    return new MyPromise(onFulfilled);
  }
  catch(onRejected) {
    if (this.status === "PENDING") {
      this.rejectedFns.add(onRejected);
    }
    return new MyPromise(onRejected);
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("test111");
  }, 2000);
})
  .then((res) => {
    console.log("res: ", res);
  })
  .catch((err) => {
    console.log("err: ", err);
  })
  .then((res) => {
    console.log("res222: ", res);
  });

// new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject("11122");
//   }, 1000);
// })
//   .then((res) => {
//     console.log("res: ", res);
//   })
//   .catch((err) => {
//     console.log("err: ", err);
//   });
