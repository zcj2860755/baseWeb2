import {constantRouterMap} from '@/router/index'
import store from '@/store'

const _import = require('@/router/_import_component')

const loop = {
  loopTreeItem(item, path, signList, childrenList) {
    // console.log(item)
    // if (item.authType === 3) return
    let pathTop = path
    let userRoutesItem = {}
    userRoutesItem.path = item.authUrl
    userRoutesItem.name = item.authName
    userRoutesItem.icon = item.icon
    userRoutesItem.authType = item.authType
    userRoutesItem.authSign = item.authSign
    userRoutesItem.authFilePath = item.authFilePath
    // console.log(userRoutesItem.path)
    signList.push(item.authSign)
    if (item.parentId !== '0') {
      childrenList.push(userRoutesItem)
    }

    if (item.parentId === '0') {
      // console.log(item.parentId)
      userRoutesItem.component = (resolve) => require(['@/views/layout/Layout'], resolve)
      if(item.authType==0){
        userRoutesItem.component = _import(item.authUrl)
        userRoutesItem.hidden=false
      }
    } else {
      if(item.authType == 1 || item.authType == 2){
        let realPath = item.authFilePath
        userRoutesItem.component = _import(realPath)
      }
    }
    // // 第一层路由是否有子路由
    if (item.children) {
      let childrens = item.children
      childrens.forEach((childone) => {
        loop.loopTreeItem(childone, pathTop, signList, childrenList)
      })
    } else if (item.parentId === '0') {
      let childrenRoute = []
      let childrenRouteItem = {}
      // if(item.authUrl==='/system'){
      //   userRoutesItem.redirect = item.authUrl + '/index'
      //   childrenRouteItem.path = 'index'
      //   childrenRouteItem.component = _import(path + '/index')
      // }
      childrenRoute.push(childrenRouteItem)
      userRoutesItem.children = childrenRoute

    }
    return userRoutesItem
  }
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      //state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
      // console.log(state.routers)
      // var last = [{path: '/404', redirect: '/404', hidden: true}]
      // var addup = routers.concat(last)
      // state.addRouters = addup
      // state.routers = constantRouterMap.concat(addup)
    }
  },

  actions: {

    GenerateRoutes({commit}, data) {
      return new Promise(resolve => {
        var userRoutes = data.rowRouter
        // console.log(userRoutes)
        var accessedRouters = []
        var signList = []
        userRoutes.forEach((item) => {
          let childrenList = []
          let treenode = loop.loopTreeItem(item, item.authUrl, signList, childrenList)
          treenode.children = childrenList
          // console.log('tree' + treenode)
          // console.log(childrenList)
          console.log(treenode)
          accessedRouters.push(treenode)
        })
        // console.log(accessedRouters)
        commit('SET_ROUTERS', accessedRouters)
        store.dispatch('AuthSign', signList).then(response => {
        })
        resolve()
      })
    }
  }
}

export default permission
