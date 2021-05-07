let Vue;
class Store {
  constructor(options) {
    //   将state中的数据做响应式处理
    // 为了不暴露vue实例，用_vm隐藏
    // 添加$$，Vue就不会代理，_vm就访问不到options.state中的属性，将options.state尽可能隐藏起来，用户只能使用state的方式访问options.state
    this._vm = new Vue({
      data: {
        $$state: options.state
      }
    });
    this._mutations = options.mutations;
    this._actions = options.actions;
    // 在使用时不知道上下文是谁了，所以这里锁死Store实例
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);
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
