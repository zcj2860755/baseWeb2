import {getAllDic} from '@/api/dataDar'
import {authList} from '@/api/auth'
// import {getRoleAuth} from '@/api/role'
const allDic = {
  state: {
    // allDictionary: getAllDic()
    allDictionary:'',
    accountSex:'',
    allAuthSign:'',
    // allAuthRoute:''
  },
  mutations: {
    SET_ALL_DIC: (state, allDictionary) => {
      state.allDictionary = allDictionary
    },
    SET_ACCOUNTSEX: (state, accountSex) => {
      state.accountSex = accountSex
    },
    SET_ALL_AUTHSIGN: (state, allAuthSign) => {
      state.allAuthSign = allAuthSign
    },
    // SET_ALL_AUTHROUTE: (state, allAuthRoute) => {
    //   state.allAuthRoute = allAuthRoute
    // },
  },
  actions: {
    // 获取所有字典集合
    AllDic({commit}) {
      return new Promise((resolve, reject) => {
        getAllDic().then(response => {
          // console.log(response)
          let data = response.data
          // setAllDic(data.data)
          commit('SET_ALL_DIC', data)
          // commit('SET_ACCOUNTSEX', data.accountSex.dictionary)
        })
      })
    },
    AuthSign({commit}, data) {
      return new Promise((resolve, reject) => {
        // console.log('data')
        // console.log(data)
        commit('SET_ALL_AUTHSIGN', data)
      })
    },
    // AuthRoute({commit}) {
    //   return new Promise((resolve, reject) => {
    //     getRoleAuth().then(response => {
    //       // let data = response.data.list
    //       console.log(response)
    //       // commit('SET_ALL_AUTHROUTE', data)
    //     })
    //   })
    // },
  }
}

export default allDic
