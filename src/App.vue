<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>
    </div>
    <p @click="$store.commit('add')">{{$store.state.count}}</p>
    <p @click="$store.dispatch('add')">async: {{$store.state.count}}</p>
    <p>getters:{{$store.getters.doubleCount}}</p>
    <button @click="handle">测试按钮</button>
    <router-view/>
  </div>
</template>
<script>
export default {
  methods: {
    handle() {
      // this.$store.state.count = 2;
      // this.$store.getters.doubleCount = 13;
      // console.log(this.$store.getters.doubleCount);
      // console.log(this.$router.matched);

      console.log(this.$vnode);

    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
