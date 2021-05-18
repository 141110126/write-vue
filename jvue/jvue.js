// 对obj中的属性做拦截
function defineReactive(obj, key, val) {
  // 当val是一个对象时,需要递归遍历val中的属性做拦截处理
  observe(val);
  // vue2中用Object.defineProperty()对属性进行跟踪拦截
  Object.defineProperty(obj, key , {
    get() {
      console.log(key,val);
      return val;
    },
    set(newVal) {
      val = newVal;
      console.log(val);
      // 当newVal为对象时，需要遍历newVal中的属性做拦截处理
      observe(newVal);
      // update()
    }
  })
}



// 将传入对象中的所有属性代理到指定对象上
function Proxy(vm) {
  // 遍历data中的属性，在vm中添加一样的属性，并做拦截处理
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        console.log(vm.$data[key]);
        return vm.$data[key]
      },
      set(v) {
        // 当修改vm中的属性时，data中的属性也跟着修改
        vm.$data[key] = v
        console.log(vm.$data[key]);
      }
    })
  })
}

// 遍历对象，给它的属性做响应式处理
function observe(obj){
  // 判断obj是否为对象,若不是则返回
  if(typeof obj !== "object" || obj == null) {
    return obj;
  }
  // 创建Observer实例，传入obj进行判断 遍历
  new Observer(obj);
}
// 判断是否为对象，若为对象再进行遍历
class Observer {
  constructor(obj) {
    if(Array.isArray(obj)){
      // todo
    } else{
      this.walk(obj);
    }
  }
  walk(obj) {
    // 若是对象,则遍历其属性做拦截处理
    Object.keys(obj).forEach(key => defineReactive(obj,key,obj[key]));
  }
}

class JVue {
  constructor(options) {
    // 1.获取data对象
    this.$options = options;
    this.$data = options.data;
    console.log(this.$data);
    // 2.对data做拦截处理
    observe(options.data);

    // 3.将data中的属性代理到vm中
    Proxy(this);

    // 4.编译
    new Compile(options.el, this);
  }
}

// 编译
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    const node = document.querySelector(el)
    this.compile(node);
  }
  // 判断是节点还是文本
  compile(node) {
    // 获取el的子节点
    const childNodes = node.childNodes;
    // 遍历子节点并分类判断
    Array.from(childNodes).forEach(n => {
      // 元素节点
      if(this.isElement(n)) {
        // 当子节点中还有子节点时，进行递归
        console.log(n);
        if(n.childNodes.length > 0) { 
          this.compile(n)
        }
        // 编译节点
        this.compileElement(n);

      } else if(this.isInter(n)) {
        // 插值表达式：编译文本
        this.compileText(n)
        console.log('文本',n.textContent);
      }
    })
    
  }
  // 元素节点
  isElement(n) {
    return n.nodeType === 1;
  }
  // 又是文本节点插值， 又是插值表达式，例：{{count}}
  isInter(n) {
    return n.nodeType === 3 && /\{\{(.*)\}\}/.test(n.textContent);
  }
  // 判断是否为j-指令
  isDir(attrName) {
    console.log(attrName);
    return attrName.startsWith('j-');
  }

  // 编译初始化和更新函数
  update(node, exp, dir) {
    // 编译初始化
    const fn = this[dir + 'Updater'];
    fn && fn(node, this.$vm[exp]);
    // 更新函数: watcher是在遍历节点去编译时创建的
    new Watcher(this.$vm, exp, val => {
      // 接收最新的值，更新
      fn && fn(node, val);
    });
  }

  // 编译插值表达式
  compileText(n) {
    // RegExp.$1：与上方正则表达式匹配的表达式，例：count
    // 查找vm中匹配属性的值，赋给该节点
    // n.textContent = this.$vm[RegExp.$1];
    this.update(node, RegExp.$1, "text");
  }
  // 编译节点：属性分类：j-指令， @事件
  compileElement(n) {
    const attrs = n.attributes;
    console.log(n.attributes);
    // 遍历所有属性，进行分类
    Array.from(attrs).forEach(attr => {
      const attrName = attr.name;
      const exp = attr.value;
      // 若为j-指令
      if(this.isDir(attrName)) {
        // 截取j-后的指令,并执行编译对应指令
        const dir = attrName.substring(2); //text,html,...
        this[dir] && this[dir](n, exp);
      } else {
        // 若为@事件
      }
    })
  }

  // 编译j-text
  text(n, exp) {
    this.update(node, exp, 'text');
  }
  // 真正编译j-text的方法
  textUpdater(node, val) {
    node.textContent = val;
  }

  // 编译j-html
  html(n, exp) {
    this.update(node, exp, 'html');
  }
  htmlUpdate(n, exp) {
    n.innerHTML = this.$vm[exp];
  }
}

// 负责dom更新
// watcher: watcher在编译时创建，和哪个key有关，更新函数是谁
class Watcher {
  constructor(vm, key, updater) {
    this.vm = vm;
    this.key = key; 
    this.updater = updater; 
  }
  // 将来会被Dep调用
  update() {
    this.updater.call(this.vm, this.vm[this.key]);
  }
}

// Dep：保存watcher实例的依赖类
