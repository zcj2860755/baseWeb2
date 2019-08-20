import {login, logout} from '@/api/login'
import {getRoleAuth, getUserRole} from '@/api/role'
import {
  getToken,
  setToken,
  removeToken,
  getID,
  setID,
  getAccount,
  setAccount,
  setRealName,
  getRealName,
  setGroupId,
  getGroupId,
  removeAccount,
  getAccountId,
  setAccountId,
  setRoleId,
  setAuthIds,
  getAuthIds,
  getRoleId,
  setProjectId,
  getProjectId,
  setSource,
  getSource
} from '@/utils/auth'
import store from "../index";

const user = {
  state: {
    token: getToken(),
    JSESSIONID: getID(),
    account: getAccount(),
    accountId:getAccountId(),
    realname:  getRealName(),
    avatar: '',
    roles: [],
    userId:'',
    roleId: getRoleId(),
    groupId: getGroupId(),
    authIds:getAuthIds(),
    signSet:[],
    flag:[],
    source: '', //getSource()
    noticeCount:''
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER_ID: (state, userId) => {
      state.userId = userId
    },
    SET_ROLE_ID: (state, roleId) => {
      state.roleId = roleId
    },
    SET_REAL_NAME: (state, realname) => {
      state.realname = realname
    },
    SET_PRO_ID: (state, groupId) => {
      state.groupId = groupId
    },
    SET_AUTH_IDS: (state, authIds) => {
      state.authIds = authIds
    },
    SET_SIGNSET: (state, signSet) => {
      state.signSet = signSet
    },
    SET_FLAG: (state, flag) => {
      state.flag = flag
    },
    SET_SOURCEL: (state, source) => {
      state.source = source
    },
    SET_NOTICE_COUNT: (state, noticeCount) => {
      state.noticeCount = noticeCount
    },
  },

  actions: {
    // 登录
    Login({commit}, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password)
          .then(response => {
            if(response.success){
              const data = response.data
              setID(data.JSESSIONID)
              setAuthIds(data.signSet)
              setRoleId(data.roleId)
              setRealName(data.realName)
              setGroupId(data.groupId)
              setToken(data.uuid)
              setAccountId(data.userId)
              setAccount(data.account)
              setProjectId(data.groupId)
              setSource(userInfo.sourceUrl)
              commit('SET_TOKEN', data.uuid)
              // commit('SET_ACCOUNT_ID', data.userId)
              commit('SET_ROLE_ID', data.roleId)
              commit('SET_AUTH_IDS', data.signSet)
              commit('SET_PRO_ID', data.groupId)
              commit('SET_REAL_NAME', data.realName)
              commit('SET_SOURCEL', userInfo.sourceUrl)
            }
            resolve(response)
          }).catch(error => {
            reject(error)
         })
      })
    },

    // 获取/更新用户信息
    RoleAuth({commit}) {
      return new Promise((resolve, reject) => {
        // console.log(store.getters.authIds)
        commit('SET_FLAG', "123")
        return resolve(getRoleAuth(store.getters.authIds))
      })
    },

    // 登出
    LogOut({commit, state}) {
      return new Promise((resolve, reject) => {
        logout(getAccountId()).then(() => {
          commit('SET_TOKEN', '')
          // commit('SET_ACCOUNT_ID', '')
          commit('SET_ROLE_ID', '')
          commit('SET_AUTH_IDS', '')
          commit('SET_PRO_ID', '')
          commit('SET_REAL_NAME', '')
          commit('SET_FLAG', [])
          removeToken()
          // removeID()
          removeAccount()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({commit}) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },
  }

}

export default user
