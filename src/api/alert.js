import fetch from '@/utils/fetch'
import Qs from 'qs'

//基础参数列表
export function alertList(params) {
  return fetch({
    url: 'alert/list',
    method: 'post',
    data: Qs.stringify({ 
      param: params.param, 
      beginTime: params.beginTime,
      endTime: params.endTime, 
      pageNo: params.pageNo, 
      pageSize: params.pageSize, 
      isHandle: params.isHandle,
      isRecover: params.isRecover,
      isAssigned: params.isAssigned
    })
  })
}

export function doAlert(params) {
  return fetch({
    url: 'alert/doAlert',
    method: 'post',
    data: params
  })
}

export function confirmBack(params) {
  return fetch({
    url: 'alert/confirmBack',
    method: 'post',
    data: params
  })
}

export function deviceCode(params) {
  return fetch({
    url: 'trail/list',
    method: 'post',
    data: Qs.stringify({ 
      deviceCode: params.deviceCode,
      beginTime: params.beginTime,
      endTime: params.endTime
    })
  })
}

export function getAlertCount(params) {
  return fetch({
    url: 'alert/export',
    method: 'post',
    data: Qs.stringify({ 
      param: params.param, 
      beginTime: params.beginTime,
      endTime: params.endTime, 
      pageNo: params.pageNo, 
      pageSize: params.pageSize, 
      isHandle: params.isHandle,
      isRecover: params.isRecover,
      isAssigned: params.isAssigned
    })
  })
}


//指派车队
export function orgGroupTree(params) {
  return fetch({
    url: '/org/orgTree',
    method: 'get',
    data: Qs.stringify({ 
   
    })
  })
}
export function doAssign(params) {
  return fetch({
    url: 'alert/doAssign',
    method: 'post',
    data: params
  })
}