<template>
  <div class="container">
    <!-- 1. 静态提升：无动态绑定，编译时提升到渲染函数外 -->
    <div class="static-title">Vue 3 编译优化示例</div>
    <div class="static-desc">核心：静态提升 + PatchFlags + 树打平 + 缓存</div>

    <!-- 2. PatchFlags：仅文本更新（标记 TEXT） -->
    <div class="dynamic-text">{{ dynamicText }}</div>

    <!-- 3. PatchFlags：仅class更新（标记 CLASS） -->
    <div :class="dynamicClass">动态Class</div>

    <!-- 4. 缓存优化：事件函数缓存 -->
    <button @click="handleClick">点击更新文本</button>
    <button @click="() => updateClass()">点击更新Class</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 动态数据
const dynamicText = ref('初始文本')
const dynamicClass = ref('default-class')

// 事件函数：会被 Vue 3 缓存
const handleClick = () => {
  dynamicText.value = `更新时间：${new Date().toLocaleTimeString()}`
}

const updateClass = () => {
  dynamicClass.value = dynamicClass.value === 'default-class' 
    ? 'active-class' 
    : 'default-class'
}

/* 
  编译后关键逻辑（伪代码）：
  // 1. 静态节点提升
  const hoisted1 = createVNode('div', { class: 'static-title' }, 'Vue 3 编译优化示例')
  const hoisted2 = createVNode('div', { class: 'static-desc' }, '核心：静态提升 + PatchFlags + 树打平 + 缓存')

  // 2. 动态节点打 PatchFlags
  function render() {
    return createVNode('div', { class: 'container' }, [
      hoisted1, // 复用静态节点
      hoisted2, // 复用静态节点
      // TEXT 标记（1）：仅检查文本更新
      createVNode('div', { class: 'dynamic-text' }, dynamicText.value, 1),
      // CLASS 标记（2）：仅检查class更新
      createVNode('div', { class: dynamicClass.value }, '动态Class', 2),
      // 事件函数缓存
      createVNode('button', { onClick: handleClick }, '点击更新文本'),
      createVNode('button', { onClick: updateClass }, '点击更新Class')
    ])
  }
*/
</script>

<style scoped>
.default-class { color: #333; }
.active-class { color: red; font-weight: bold; }
.static-title { font-size: 18px; font-weight: bold; }
.static-desc { color: #666; margin: 10px 0; }
.dynamic-text { margin: 10px 0; }
button { margin: 0 5px; padding: 5px 10px; }
</style>