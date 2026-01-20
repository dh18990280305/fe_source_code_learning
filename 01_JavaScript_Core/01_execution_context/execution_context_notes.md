
# 执行上下文 / 调用栈 / 作用域链

## 执行上下文

定义：执行上下文是Javascript代码被解析和执行时所在的环境，里面存储了代码执行所需要的信息；

1. 执行上下文的类型
- 全局执行上下文 - global EC
 - 代码开始执行前首先进入的环境。
 - 一个程序只有**一个**全局执行上下文。
 - 创建一个全局对象(浏览器中时Window，Node中时global)，将this指向这个全局对象。

- 函数执行上下文 - Function EC
 - 每当一个函数调用时都会创建一个新的FEC, 不限制个数。

- Eval执行上下文
 - 运行在 eval 函数内部的代码（开发中禁止使用，了解）。

2. 执行上下文的生命周期（重点：创建与销毁）
执行上下文的生命周期分为两个阶段：创建阶段 和 执行阶段。
 - 创建阶段
 在代码真正执行之前，JS 引擎会先扫描一遍，做三件大事：
 1. 确定 this 的指向 (This Binding)：
  - 全局环境：this -> window。
  - 函数环境：取决于函数如何被调用（普通调用、对象调用、new 调用、apply/call/bind）。

 2. 词法环境组件 (LexicalEnvironment)：
  - 创建环境记录 (Environment Record)：存储变量和函数声明。
  - 创建外部环境引用 (Outer Environment Reference)：记录当前环境的 “父级” 环境（作用域链的关键）。

 3. 变量环境组件 (VariableEnvironment)：
  - 同样包含一个环境记录和外部引用。
  - 区别： 在 ES6 中，LexicalEnvironment 用于存储 let 和 const 声明的变量（处于 TDZ 暂存死区），而 VariableEnvironment 专门用于存储 var 声明 的变量（会被提升，初始化为 undefined）。
 - 执行阶段 (Execution Phase) - 干活
  - 变量赋值。
  - 函数执行。 
  - 代码一行行运行。

2. 