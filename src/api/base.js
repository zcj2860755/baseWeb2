import fetch from '@/utils/fetch'
import Qs from 'qs'

//基础参数列表
export function baseList(params) {
  return fetch({
    url: '/sys/params/pageList',
    method: 'get',
    params: { keyWord: params.keyword,pageNo: params.pageNo,pageSize: params.pageSize}
  })
}

//基础参数编辑
export function baseDetail(id) {
  return fetch({
    url: '/sys/params/findById',
    method: 'get',
    data: Qs.stringify({ id: id}),
    params:{id:id}
  })
}

//基础参数删除
export function baseDelete(ids) {
  return fetch({
    url: '/sys/params',
    method: 'delete',
    params:{id:ids}
  })
}

//基础参数提交
export function baseSubmit(params) {
  return fetch({
    url: '/sys/params',
    method: 'put',
    params
  })
}


//基础参数新增
export function baseAddSubmit(params) {
  return fetch({
    url: '/sys/params',
    method: 'post',
    params
  })
}
