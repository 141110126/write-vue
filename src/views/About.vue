<template>
  <div class="about">
    <h1>This is an about page</h1>
    <router-view/>

  </div>
</template>
<script>
export default  {
  name:"About",
  mounted() {
    console.log(this.$vnode);
    console.log(this.$options.name);

  }
}
</script>
