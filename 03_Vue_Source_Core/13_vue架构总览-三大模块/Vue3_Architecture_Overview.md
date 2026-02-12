## Vue 3 架构总览
### 一、核心前置认知
Vue 3 采用模块化、分层式架构设计（基于 Monorepo 管理），相比 Vue 2 的 “整体式” 架构，最大特点是「解耦核心逻辑、按需引入、跨平台扩展」，所有功能围绕「三大核心模块」展开，模块间通过标准化接口交互，兼顾灵活性与性能。

### 二、Vue 3 三大核心模块（核心拆解 + 职责标注）
Vue 3 的核心代码被拆分为编译时（Compiler）、运行时（Runtime）、响应式系统（Reactivity） 三大独立模块，且每个模块可单独使用（如仅用 Reactivity 做状态管理），是 Vue 3 架构的基石。

1. *响应式系统（Reactivity）：Vue 3 的 “数据引擎”*
- *核心定位*：独立于渲染层的数据响应式核心，是 Vue 3 响应式能力的底层支撑（可脱离 Vue 单独使用，如 @vue/reactivity 包）；
- *核心职责*：
  - 基于 Proxy（替代 Vue 2 的 Object.defineProperty）实现数据的「拦截 - 依赖收集 - 触发更新」；
  - 管理响应式数据的依赖关系（如组件渲染函数、watch 回调、computed 计算属性）；
  - 提供响应式 API（ref/reactive/computed/watch/effect 等）；
- *核心文件 / 包*：packages/reactivity/，暴露 createReactiveObject、track（收集依赖）、trigger（触发更新）等核心方法；
- *关键特性*：支持数组 / Map/Set 等复杂数据类型、深层响应式惰性处理、可手动控制依赖（effect 调度）。

2. *编译时模块（Compiler）：Vue 3 的 “代码优化器”*
- *核心定位*：将 .vue 单文件组件（SFC）/ 模板编译为「可执行的渲染函数（render）」，属于构建时环节（开发环境编译，生产环境仅用编译结果）；
- *核心职责*：
  - 模板解析（Parse）：将 HTML 模板解析为 AST 抽象语法树；
  - 优化（Optimize）：标记 AST 中的静态节点 / 静态根节点（Vue 3 核心优化点，运行时跳过静态节点更新）；
  - 代码生成（Generate）：将优化后的 AST 转换为带「补丁标记（PatchFlag）」的渲染函数；
  - 辅助功能：处理指令（v-if/v-for/v-model）、组件解析、样式提取（scoped/css module）；
- 核心文件 / 包：packages/compiler-core/（核心编译逻辑）、packages/compiler-dom/（针对 DOM 平台的编译扩展）、packages/compiler-sfc/（SFC 单文件组件编译）；
- 关键特性：编译时生成 PatchFlag（精准标记动态节点）、静态提升、缓存事件处理函数、Tree-shaking 友好。

3. *运行时模块（Runtime）：Vue 3 的 “渲染执行器”*
- *核心定位*：负责执行编译后的渲染函数，完成「虚拟 DOM（VNode）创建 - 挂载 - 更新」，是连接响应式系统与真实 DOM 的桥梁；
- *核心职责*：
  - *VNode 体系*：创建 VNode（虚拟节点）、维护 VNode 树结构；
  - *挂载（Mount）*：将 VNode 渲染为真实 DOM 并挂载到页面；
  - *更新（Patch）*：基于虚拟 DOM Diff 算法，对比新旧 VNode，执行最小化 DOM 操作；
  - *组件管理*：组件实例创建（createApp/createComponentInstance）、生命周期调度、Props / 插槽处理；
- *核心文件 / 包*：packages/runtime-core/（跨平台核心运行时）、packages/runtime-dom/（DOM 平台运行时，处理 DOM 操作 / 事件）；
- *关键特性*：基于 PatchFlag 的精准 Diff、组件级更新、跨平台渲染（支持 Web / 小程序 / 原生）。

### 三、三大模块交互逻辑（核心流程 + 模块联动）
Vue 3 所有功能的执行，本质是三大模块的协同工作，以「组件渲染 - 更新」为例，完整交互流程如下:

![vue三大模块交互流程](./Vue3三大模块交互流程.svg)

*核心交互关键点标注*：
1. *Compiler → Runtime*：编译后的渲染函数携带「PatchFlag」和「静态节点标记」，为 Runtime 的精准 Diff 提供依据；
2. *Runtime → Reactivity*：执行渲染函数时，访问响应式数据会触发 track，收集 “渲染函数 - 数据” 的依赖关系；
3. *Reactivity → Runtime*：响应式数据更新触发 trigger，通知 Runtime 重新执行渲染函数，完成 DOM 更新；
4. *模块解耦*：每个模块通过「接口约定」交互（如 Runtime 仅调用 Reactivity 的 effect/track/trigger，不耦合内部实现），可单独替换 / 扩展（如自定义 Compiler 生成适配小程序的渲染函数）。