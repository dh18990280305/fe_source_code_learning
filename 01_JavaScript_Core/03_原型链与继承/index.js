// 1. 原型继承
function Parent(name, age){
    this.name = name
    this.age = age
}

function Child(){}

Child.prototype = new Parent('xx', 'yy')
Child.prototype.constructor = Child

const c1 = new Child()

// console.log(c1.name, c1.age)

// 2. 借用构造函数继承
function Parent2(name, age){
    this.name = name
    this.age = age
}

Parent2.prototype.log = () => {
    console.log('父类原型方法--------')
}

function Child2(sex, ...args){
    this.sex = sex
    Parent2.call(this, ...args)
}

const c2 = new Child2('女', '刘亦菲', '22')
// console.log(c2.sex, c2.name, c2.age) // 女 刘亦菲 22
// c2.log() // c2.log is not a function

// 3. 组合继承
function Parent3(name, age){
    this.name = name
    this.age = age
}

Parent3.prototype.log = () => {
    console.log('我是刘德华--------')
}

function Child3(sex, ...args){
    this.sex = sex
    Parent3.call(this, ...args)
}

Child3.prototype = new Parent3()

const c3 = new Child3('男', '刘德华', '18')
// c3.log() // 我是刘德华--------

// 4. 原型式继承 - 对象
function createObj(obj) {
  function F(){}
  F.prototype = obj
  return new F()
}

const parent = {
  name: '张学友',
  friends: ['小明', '小张']
};

const childObj = createObj(parent)

// console.log(childObj.name) // 张学友
// childObj.friends.push('周润发')
// console.log(parent.friends) // [ '小明', '小张', '周润发' ]

// 5. 寄生式继承
function createChild(parent){
    const child = Object.create(parent)
    child.log = () => {
        console.log('寄生式继承-------')
    }
    return child
}

const parent2 = {
  name: '张学友',
  friends: ['小明', '小张']
};

const child5 = createChild(parent2)
const child6 = createChild(parent2)
// child5.log() // 寄生式继承-------
// console.log(child5.log === child6.log) // false

// 6. 寄生组合式继承
function Parent6(name, age){
    this.name = name
    this.age = age
}

Parent6.prototype.log = () => {
    console.log('寄生组合式继承--------')
}

function Child6(sex, ...args){
    this.sex = sex
    Parent6.call(this, ...args)
}

const proxyObj = Object.create(Parent6.prototype)
Child6.prototype = proxyObj
proxyObj.constructor = Child6

const c6 = new Child6('男', '刘德华', '18')
// c6.log() // 寄生组合式继承--------
// console.log(c6.__proto__.__proto__ === Parent6.prototype) // true
// console.log(c6.constructor === Child6) // true

// 7. ES6 - Class继承
class Parent7 {
    constructor(name, age){
        this.name = name
        this.age = age
    }
    log(){
        console.log('父类方法-----------')
    }
    static hello(){
        console.log('父类static----------')
    }
}

class Child7 extends Parent7 {
    constructor(sex, ...args){
        super(...args)
        this.sex = sex
    }
    log(){
        super.log()
        console.log('子类方法------------')
    }
    static hello(){
        console.log('子类static----------')
        super.hello()
    }
}

const c7 = new Child7('男', '周星驰', 18)
console.log(c7) // Child7 { name: '周星驰', age: 18, sex: '男' }
c7.log() // 父类方法----------- 子类方法------------
Child7.hello() // 子类static---------- 父类static----------
