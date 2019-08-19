import fetch from '@/utils/fetch'
import Qs from 'qs'

//用户列表
export function getAccountList(params) {
  return fetch({
    url: '/account/list',
    method: 'get',
    params: { //请求参数
      searchContent: params.keyword,
      pageNo: params.pageNo,
      pageSize: params.pageSize
    }
  })
}

//查询启用用户列表
export function getAccountAbleList(params) {
  return fetch({
    url: '/account/ableUserList',
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
    url: '/account/deleteAccount',
    method:'delete',
    params: { //请求参数
      ids: params
    }
  })
}


