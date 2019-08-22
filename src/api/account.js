import fetch from '@/utils/fetch'
import {getToken} from '@/utils/auth'
import Qs from 'qs'

//用户列表
export function getAccountList(params) {
  return fetch({
    url: 'base/account/list',
    method: 'get',
    params: { //请求参数
      searchContent: params.keyword,
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      uuid : getToken()
    }
  })
}

//查询启用用户列表
export function getAccountAbleList(params) {
  return fetch({
    url: 'base/account/ableUserList',
    method: 'get',
    params:{
      deviceId:params.deviceId,
      projectId:params.projectId
    }
  })
}

//删除用户
export function deleteAccount(params) {
  return fetch({
    url: 'base/account/deleteAccount',
    method:'delete',
    params: { //请求参数
      ids: params
    }
  })
}



