import fetch from '@/utils/fetch'
import Qs from 'qs'

 //获取用户角色
export function getUserRole () {
  return fetch({
    url: '/base/role/getUserRole',
    method: 'post'
  })
}
// 获取账号下所有角色列表
export function findRoleByAccount () {
  return fetch({
    url: '/base/role/findAllRole',
    method: 'get'
  })
}
 //获取当前角色路由
export function getRoleAuth (roleId) {
  return fetch({
    url: '/base/authority/getRoleAuth',
    method: 'post',
    data: Qs.stringify({ids:roleId})
  })
}

 //角色列表
 export function roleList(params) {
   return fetch({
   url: '/base/role/pageList',
   method: 'get',
     params: { //请求参数
       searchContent: params.keyword,
       pageNo: params.pageNo,
       pageSize: params.pageSize
     }
   })
 }

 //删除角色
export  function deleteRole(params){
  return fetch({
    url:'base/role/'+params,
    method:'delete'
  })
}

