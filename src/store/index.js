import Vue from "vue";
import Vuex from "./jvuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    add(state) {
      state.count++;
    }
  },
  actions: {
    add({ commit }) {
      setTimeout(() => {
        commit("add");
      }, 1000);
    }
  },
  modules: {},
  getters: {
    doubleCount(state) {
      return state.count * 2; 
    }
  }
});
