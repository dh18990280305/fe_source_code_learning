class Depend {
    constructor(){
        this.effectFns = new Set()
    }
    track(){
        this.effectFns.add(dependCollection.dependCallback)
        dependCollection.dependCallback = null
    }
    trigger(){
        if(this.effectFns.size <= 0) return
        for(let fn of this.effectFns){
            fn?.()
        }
    }
}

class CollectionOfDepend {
    _dependWeakMap = null
    dependCallback = null
    constructor(){
        this._dependWeakMap = new WeakMap()
    }
    trackDepend(target, key){
        let dependMap = this._dependWeakMap.get(target)
        if(!dependMap){
            dependMap = new Map()
            this._dependWeakMap.set(target, dependMap)
        }
        let depend = dependMap.get(key)
        if(!depend){
            depend = new Depend()
            dependMap.set(key, depend)
        }
        depend.track()
    }
    trigger(target, key){
        this._dependWeakMap.get(target)?.get?.(key)?.trigger?.()
    }
}

const dependCollection = new CollectionOfDepend()

const isDeepMap = (value) => {
    if(value === null) return false
    return (typeof value === 'object') || Array.isArray(value)
}

const reactive = (proxyObj) => {
    return new Proxy(proxyObj, {
        get(target, key, receiver){
            const value = Reflect.get(target, key, receiver)
            // 对象继续深层遍历
            if(isDeepMap(value)){
                return reactive(value)
            }
            dependCollection.trackDepend(target, key)
            return value
        },
        set(target, key, value , receiver){
            const oldValue = Reflect.get(target, key)
            Reflect.set(target, key, value, receiver)
            // value没有改变时不触发
            if(oldValue === value) return
            dependCollection.trigger(target, key)
        }
    })
}

const userInfo = reactive({
    name: '刘德华',
    age: 18,
    sex: '男',
    friend: {
        name: '小孔'
    }
})

const watchEffect = (initinalFn) => {
    dependCollection.dependCallback = typeof initinalFn === 'function' ? initinalFn : () => {}
    try {
        initinalFn()
    } catch (error) {
        throw new Error(error)
    } finally {
        dependCollection.dependCallback = null
    }
}

watchEffect(() => {
    console.log('watchEffect1', userInfo.name)
})

watchEffect(() => {
    console.log('watchEffect2', userInfo.age)
})

watchEffect(() => {
    console.log('watchEffect3', userInfo.name, userInfo.age)
})

watchEffect(() => {
    console.log('watchEffect4', userInfo.friend.name)
})

// userInfo.name = '张学友'
userInfo.friend.name = '小明'

// 打印结果 --------------------------------------------
// watchEffect1 刘德华
// watchEffect2 18
// watchEffect3 刘德华 18
// watchEffect4 小孔
// watchEffect4 小明