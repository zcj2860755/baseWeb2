import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import allDic from './modules/allDic'
import getters from './getters'
import 'babel-polyfill'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    allDic
  },
  getters
})

export default store
