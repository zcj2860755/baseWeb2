import axios from 'axios'
import {Message} from 'element-ui'
import {MessageBox} from 'element-ui'
import store from '../store'
import {getToken, getID, getAccount, getAccountId} from '@/utils/auth'
import URLConfig from '@/config'
axios.defaults.withCredentials=true;
// 创建axios实例

const service = axios.create({
  baseURL: URLConfig.ip,
  timeout: 6000000
})

// request拦截器
service.interceptors.request.use(config => {
  // console.log(store.getters.token)
  if (store.getters.token) {
    config.headers['token'] = store.getters.token // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  if (store.getters.JSESSIONID) {
    config.headers['JSESSIONID'] = store.getters.JSESSIONID
    // if (config.params) {
    //   config.url += '&' + Qs.stringify({'JSESSIONID': store.getters.JSESSIONID})
    // } else {
    //   config.url += '?' + Qs.stringify({'JSESSIONID': store.getters.JSESSIONID})
    // }
  }

  var date = new Date();
  if(config.params){
    config.params.timestamp = date.getTime()
  }else{
    config.params = {}
    config.params.timestamp = date.getTime()
  }
  config.headers['token'] = getToken()
  return config
}, error => {
  // Do something with request error
  //console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    //  const res = response.data
    //consoleLog('response', response.data)// for debug
    // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
    if (response.data.statusCode === 1007) {
      MessageBox.confirm('请重新登录', '确定登出', {
        confirmButtonText: '重新登录',
        type: 'warning'
      }).then(() => {
        store.dispatch('FedLogOut').then(() => {
          location.reload()// 为了重新实例化vue-router对象 避免bug
        })
      })
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error)// for debug
    if (error.response.status === 401) {
      MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
        confirmButtonText: '重新登录',
        type: 'warning'
      }).then(() => {
        store.dispatch('FedLogOut').then(() => {
          location.reload()// 为了重新实例化vue-router对象 避免bug
        })
      })
    } else if (error.response.status === 404) {
      //TODO 处理404页面
    } else {
      if (error.response.data.statusCode === 40000) {
        MessageBox.confirm('你的访问授权已过期，请重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        })
      } else {
        console.log('err', error.response.data)// for debug
        Message({
          message: error.response.data.message,
          type: 'error',
          duration: 5 * 1000
        })
      }
    }
    return Promise.reject(error)
  }
)

function consoleLog(tag, obj) {
  console.log(tag + ':' + JSON.stringify(obj))// for debug
}

export default service
