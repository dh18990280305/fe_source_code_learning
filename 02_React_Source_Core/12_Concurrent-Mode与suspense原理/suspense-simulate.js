// 模拟 React 的 Suspense 核心逻辑
class SuspenseSimulator {
  constructor() {
    // 存储待解析的 Promise 和对应的重试渲染函数
    this.pendingPromises = new Map();
    // 根容器
    this.root = null;
  }

  // 挂载根组件
  render(element, container) {
    this.root = container;
    this._renderElement(element);
  }

  // 核心渲染逻辑：捕获异步资源的 Promise，显示 fallback，等待后重试
  _renderElement(element) {
    try {
      // 渲染组件内容（如果组件读取未就绪的异步资源，会抛出 Promise）
      const content = element.type({ fallback: element.props.fallback });
      this.root.innerHTML = '';
      this.root.appendChild(content);
    } catch (e) {
        console.log('catch', e)
      // 捕获到 Promise，进入 Suspense 等待逻辑
      if (e instanceof Promise) {
        const promise = e;
        // 显示 fallback 内容
        this.root.innerHTML = '';
        this.root.appendChild(element.props.fallback);

        // 避免重复监听同一个 Promise
        if (!this.pendingPromises.has(promise)) {
          this.pendingPromises.set(promise, () => {
            this._renderElement(element);
            this.pendingPromises.delete(promise);
          });

          // 等待 Promise 完成后，重新渲染
          promise.then(() => {
            const retryRender = this.pendingPromises.get(promise);
            retryRender && retryRender();
          }).catch(err => {
            console.error('Suspense 异步资源加载失败:', err);
            this.root.innerHTML = '<div>加载失败，请重试</div>';
            this.pendingPromises.delete(promise);
          });
        }
      } else {
        // 非 Promise 异常，直接抛出
        throw e;
      }
    }
  }
}

// ---------------------- 测试用例 ----------------------
// 1. 模拟异步资源（比如远程数据请求）
function fetchData() {
  // 模拟 2 秒后返回数据
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve({ name: 'React Suspense 模拟实现', author: '学习笔记' });
    }, 2000);
  });

  // 封装成 Suspense 可识别的“未就绪资源”：读取时抛出 Promise
  let status = 'pending';
  let result = null;
  return {
    read() {
      if (status === 'pending') {
        throw promise; // 抛出 Promise，触发 Suspense
      } else if (status === 'error') {
        throw new Error('数据加载失败');
      } else {
        return result;
      }
    },
    // 触发数据加载
    load() {
      promise.then(data => {
        status = 'success';
        result = data;
      }).catch(() => {
        status = 'error';
      });
    }
  };
}

const dataResource = fetchData();

// 2. 模拟依赖异步资源的组件
const DataComponent = ({ fallback }) => {
    dataResource.load(); // 触发数据加载
    const data = dataResource.read(); // 读取数据，未就绪时抛出 Promise

    // 渲染实际内容
    const div = document.createElement('div');
    div.style.padding = '20px';
    div.innerHTML = `
        <h3>${data.name}</h3>
        <p>${data.author}</p>
        <p>加载完成时间：${new Date().toLocaleTimeString()}</p>
    `;
    return div;
};

// 3. 模拟 Suspense 组件

const Suspense = ({ fallback, children }) => {
  // 这里简化处理：children 是需要异步加载的组件
  return {
    type: children,
    props: { fallback }
  };
};

// 4. 初始化并运行模拟
const suspense = new SuspenseSimulator();
// 创建 fallback 元素
const fallback = document.createElement('div');
fallback.innerHTML = '<div style="color: #666;">加载中... 🌀</div>';

// 挂载 Suspense 组件
suspense.render(
  Suspense({
    fallback: fallback,
    children: DataComponent
  }),
  document.getElementById('root')
);