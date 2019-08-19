import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import {getToken} from '@/utils/auth' // 验权

const whiteList = ['/login']
router.beforeEach((to, from, next) => {
  NProgress.start()
  if ( (getToken() || store.getters.token)&&store.getters.token!='zdzcadminloginsuccess') {
    if (to.path === '/login') {
      next({path: '/home'})
    } else {
      if (store.getters.flag.length == 0) {
        store.dispatch('RoleAuth').then(response => {
          const rowRouter = response.data
          store.dispatch('GenerateRoutes', {rowRouter}).then(() => {
            router.addRoutes(store.getters.addRouters)
            next({...to})
          })
        })
        // 字典
        store.dispatch('AllDic').then(response => {
        })
        // 收件箱未读消息
        store.dispatch('NoticeCount').then(response => {
        })
        // store.dispatch('AuthSign').then(response => {
        // })

        // store.dispatch('AuthRoute').then(response => {
        // })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
