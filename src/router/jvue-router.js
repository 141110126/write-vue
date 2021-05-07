// 设置vue以便后面使用
let Vue;
class VueRouter {
  constructor(options) {
    this.options = options;

    // 初始化current，设置current为响应式数据，当current改变时重新渲染页面
    Vue.util.defineReactive(
      this,
      "current",
      window.location.hash.slice(1) || "/"
    );
    console.log(Vue.util);

    // 监听url变化，重置current
    window.addEventListener("hashchange", () => {
      this.current = window.location.hash.slice(1);
      console.log(this.current);
    });
  }
}

// vue插件都要有install方法：注册router-link和router-view两个组件 使得我们在组件中使用时可以<router-view>，将router挂载到Vue原型链上,使得我们在组件中使用时可以this.$router
VueRouter.install = function(_vue) {
  Vue = _vue;
  console.log(_vue);

  //   将router挂载到Vue原型链上
  // 因为VueRouter执行install时Vue实例还没有创建（详见main.js），所以要使用混入的方式，在beforeCreate时再挂载
  Vue.mixin({
    beforeCreate() {
      // 判断当前组件是否为根组件，只有根组件有$router
      //   因为根组件的vue实例创建时传入了vueRouter实例，vue组件中获取传入的参数可使用this.$options，所以获取传入的vueRouter实例可以用this.$options.router
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
      }
    }
  });
  //   注册router-view
  //   根据当前hash找到对应component
  // hash:window.location.hash.slice(1)
  // 获取路由映射表：VueRouter在创建实例时传入了路由映射表，所以从VueRouter初始化中获取
  Vue.component("router-view", {
    render(h) {
      const { current, options } = this.$router;
      let component = null;
      const route = options.routes.find(route => route.path === current);
      if (route) {
        component = route.component;
      }
      return h(component);
    }
  });
  //   注册router-link
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render(h) {
      return h("a", { attrs: { href: "#" + this.to } }, this.$slots.default);
    }
  });
};

export default VueRouter;
