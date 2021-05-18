import Vue from "vue";
import VueRouter from "./jvue-router";
import Home from "../views/Home.vue";
import Intro from "../views/Intro.vue";
import About from "../views/About.vue";



Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    component: About,  
    children: [
      {
        path: "/about/intro",
        name: "Intro",
        component: Intro
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

export default router;
