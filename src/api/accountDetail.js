import fetch from '@/utils/fetch'
import Qs from 'qs'

 //编辑用户
 export function editAccount(params){
   return fetch({
     url:'/account',
     method:'put',
     params
   })
 }

 //保存用户
 export function submitAccount (params){
  return fetch({
    url:'/account',
    method:'post',
    params
  })
 }

 //验证账号是否存在
 export function verifyAccount (account){
  return fetch({
    url:'/account/verifyAccount',
    method:'get',
    params:{
      account:account
    }
  })
 }

  //修改账户密码
  export function updatePW (params){
    return fetch({
      url:'/account/updatePW',
      method:'put',
      params
    })
   }

//账号详情
export function AccountInfo(accountId){
  return fetch({
    url:'/account/'+accountId,
    method:'get'
  })
}


