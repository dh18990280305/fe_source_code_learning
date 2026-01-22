
// 模块化封装
const counterModule = (function (){
    // 私有化变量
    let counter = 0
    // 全局作用域无法方法，只能通过对外暴露方法操作和获取
    return {
        log(){
            console.log(counter)
        },
        increment(){
            counter++
            this.log()
        },
        getCount(){
            return counter
        }
    }
}())
// counterModule.log()
// counterModule.increment()
// counterModule.increment()

// 防抖函数
const debounce = (fn, delay, immediate = false) => {
    let timer = null
    return function (...args){
        const firstCall = immediate && !timer
        if(timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
            timer = null
        }, delay)
        if(firstCall){
            fn.apply(this, args)
        }
    }
}

const handleClick = debounce((...args) => {
    console.log('防抖测试-------', args)
}, 1000, true)

// handleClick(1,2,3)


// 节流函数
function throttle(fn, delay, params = { leading: false, trailing: false }){
    let lastTime = 0;
    let timer = null
    const { leading, trailing } = params
    function exec(context, args){
        fn.call(context, ...args)
        lastTime = Date.now()
    }
    return function(...args){
        const currentTime = Date.now()
        const context = this
        if(lastTime === 0){
            if(leading){
                exec(context, args)
                return
            }
            lastTime = currentTime
        }
        // 剩余时间
        const remaining  = delay - (currentTime - lastTime) 
        if(remaining <= 0){
            if(timer){
                clearTimeout(timer)
                timer = null
            }
            exec(context, args)
        }
        // 开启trailing && 只设置一个setTimeout
        else if(trailing && !timer){
            timer = setTimeout(() => {
                exec(context, args)
                timer = null
                lastTime = Date.now();
            }, remaining)
        }
    }
}


const handleClick2 = throttle((...args) => {
    console.log('节流测试---------', args)
}, 1000, { leading: true, trailing: true })

window.addEventListener('scroll', () => {
    handleClick2()
})

// 私有函数
function createUser(name, password) {
  // 私有变量
  const _password = password;

  // 对外暴露
  return {
    name: name,
    verifyPassword: function(inputPwd) {
      return inputPwd === _password;
    }
  };
}

const user = createUser('张三', '123456');
console.log(user.name); // 张三
console.log(user._password); // undefined（私有变量）