let Vue;
class Store {
  constructor(options) {
    this._mutations = options.mutations;
    this._actions = options.actions;
    

    // 在使用时不知道上下文是谁了，所以这里锁死Store实例
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);

    // 初始化computed，方便getters中使用
    const computed = {};
    this._wrappedGetters = options.getters;
    this.getters = {};
    // 由于forEach中的this已经不再是Store实例，所以在这里将this存为store
    const store = this;
    Object.keys(this._wrappedGetters).forEach(key => {
      // 获取getters
      const fn = store._wrappedGetters[key];
      // 由于使用computed时不能带参数，所以我们在computed中设置同名参数，返回高阶函数fn，并传入参数执行
      computed[key] = function() {
        return fn(store.state)
      }
      // 由于用户只能读取getters，所以只定义只读属性
      Object.defineProperty(store.getters, key, {
        // computed中把key都放到_vm中了，所以这里可以用_vm获取key
        get: () => store._vm[key]
      })
    })

    //   将state中的数据做响应式处理
    // 为了不暴露vue实例，用_vm隐藏
    // 添加$$，Vue就不会代理，_vm就访问不到options.state中的属性，将options.state尽可能隐藏起来，用户只能使用state的方式访问options.state
    this._vm = new Vue({
      data: {
        $$state: options.state
      },
      // 设置computed
      computed:computed
    });
  }
  get state() {
    return this._vm._data.$$state;
  }
  set state(v) {
    console.error("请使用replaceState重置状态");
  }
  commit(type, payload) {
    const mutation = this._mutations[type];
    if (mutation) {
      mutation(this.state, payload);
    }
  }
  dispatch(type, payload) {
    const action = this._actions[type];
    if (action) {
      action(this, payload);
    }
  }
}
function install(_vue) {
  Vue = _vue;
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store;
      }
    }
  });
}
export default { Store, install };
