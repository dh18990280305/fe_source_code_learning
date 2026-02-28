const obj1 = {
  name: '刘德华',
  age: 18,
  sex: '男',
  love: {
    name: '小青',
    age: 19,
    firends: ['小白', '小黑', {
      name: '小紫',
      age: 20
    }]
  },
}
obj1.firend = obj1

const obj2 = cloneDeep(obj1)

function cloneDeep(value, cache = new WeakMap()){
  if(value === null || typeof value !== 'object') return value
  // 处理循环引用，避免再次进行循环直接返回存储值
  if(cache.get(value)){
    return cache.get(value)
  }
  let cloneObj = Array.isArray(value) ? [] : {}
  cache.set(value, cloneObj)

  for (const key of Reflect.ownKeys(value)) {
    if (!Object.hasOwn(value, key)) continue;
    cloneObj[key] = cloneDeep(value[key], cache)
  }
  
  return cloneObj
}

console.log(obj1 === obj2)
console.log(obj1.firend, obj2.firend, obj1.firend === obj2.firend)