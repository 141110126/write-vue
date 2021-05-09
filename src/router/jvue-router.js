// 设置vue以便后面使用
let Vue;
class VueRouter {
  constructor(options) {
    this.options = options;

    // 初始化current，设置current为响应式数据，当current改变时重新渲染页面
    // Vue.util.defineReactive(
    //   this,
    //   "current",
    //   window.location.hash.slice(1) || "/"
    // );

    // 嵌套路由中，router-view组件中不再需要根据current查找渲染对应组件，所以不需要current是响应式的,而需要代表深度层级的响应式matched数组
    this.current = window.location.hash.slice(1) || "/";
    Vue.util.defineReactive(this, "matched", []);
    // 匹配路由
    this.match();

    // 监听url变化，重置current
    window.addEventListener("hashchange", () => {
      this.current = window.location.hash.slice(1);

      // 路径发生变化要把matched数组清空，重新匹配
      this.matched = [];
      this.match();
    });
  }

  // 设置match方法，遍历路由表，获取匹配关系数组
  match(routes){
    routes = routes || this.options.routes;
    // 递归遍历
    for(const route of routes) {
      // 一般不会在Home配置子路由,所以暂时不考虑该路由有子路由的情况
      if(route.path === "/" && this.current === "/") {
        this.matched.push(route)
        console.log(this.matched);
        return;
      }
      // 判断当前hash是否与路由匹配，若匹配则将路由加入matched数组中，并递归其子路由
      if(route.path !== " /"  && this.current.indexOf(route.path) != -1) {
        this.matched.push(route);
        if(route.children) {
          this.match(route.children)
        }
        console.log(this.matched);
        return;
      }
    }
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
      // 嵌套路由
      // 思路：获取路由的层级深度，路由匹配时获取代表深度层级的数组matched，调用router-view组件时找到matched[depth]对应的组件
      // 在虚拟dom中设置routerView表明此组件是否为routerView组件
      this.$vnode.data.routerView = true;
      console.log(this.$vnode);
      let depth = 0;
      let parent = this.$parent;
      // 循环获取所有parent
      while(parent) {
        // 获取$vnode.data
        const vnodeData =  parent.$vnode &&  parent.$vnode.data;
        // 判断当前parent是否为router-view组件，若是，则深度加1
        if(vnodeData && vnodeData.routerView) {
          depth ++ 
        }
        console.log(parent.$vnode);
        // console.log(parent.$vnode.data);
        console.log(vnodeData.routerView);

        parent = parent.$parent
      }

      // 获取path对应的component
      let component = null;
      const route = this.$router.matched[depth];
      if(route) {
        component = route.component
      }
      console.log(depth);
      return h(component)

      // const { current, options } = this.$router;
      // let component = null;
      // const route = options.routes.find(route => route.path === current);
      // if (route) {
      //   component = route.component;
      // }
      // return h(component);
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
