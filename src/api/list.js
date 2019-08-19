import fetch from '@/utils/fetch'

export function getList (params) {
  return fetch({
    url: '/list',
    method: 'get',
    params
  })
}
export function getDataDarList (params) {
  return fetch({
    url: '/operationData/list',
    method: 'post',
    params
  })
}
