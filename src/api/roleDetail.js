import fetch from '@/utils/fetch'
import Qs from 'qs'

 //编辑角色
 export function editRole(roleId){
   return fetch({
     url:'/role/'+roleId,
     method:'get',
    //  data: Qs.stringify({roleId:roleId})
   })
 }

 //获取权限树
 export function authTree(roleId){
   return fetch({
     url:'/role/authTree',
     method:'post',
     data: Qs.stringify({roleId:roleId})
   })
 }

 //新增保存角色
 export function submitRoleAdd (params,authIds){
   return fetch({
    url:'/role',
    method:'post',
    params,
    data:Qs.stringify({authIds:authIds})
  })
 }

  //编辑保存角色
  export function submitRoleEdit (params,authIds){
    return fetch({
     url:'/role',
     method:'put',
     params,
     data:Qs.stringify({authIds:authIds})
   })
  }

 export function getRoles (roleId){
  return fetch({
    url:'/role/authTree',
    method:'post',
    data: Qs.stringify({roleId:roleId})
  })
 }

 //校验角色标识是否唯一
 export function verifyRoleCode(roleName){
   //console.log(roleSign)
   //console.log(roleId)
   return fetch({
     url:'/role/existRoleSign',
     method:'post',
     data: Qs.stringify({roleName:roleName})
   })
 }




