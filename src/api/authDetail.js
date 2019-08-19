import fetch from '@/utils/fetch'
import Qs from 'qs'

//获取权限参数子集
// export function authChild(params) {
//   return fetch({
//     url: '/auth/authChild',
//     method: 'post',
//     params
//   })
// }

//编辑权限
export function editAuth(authId){
  return fetch({
    url:'/authority/'+authId,
    method:'get',
    data: Qs.stringify({authId:authId})
  })
}

// export function getParentAuth(authId){
//   return fetch({
//     url:'/auth/echoAuthJson',
//     method:'post',
//     data: Qs.stringify({authId:authId})
//   })
// }

//提交新增权限信息
export function authAddSubmit(params) {
  return fetch({
    url: '/authority',
    method: 'post',
    params
  }) 
 }

 //提交编辑权限信息
export function authUpdateSubmit(params) {
  return fetch({
    url: '/authority',
    method: 'put',
    params
  }) 
 }

//验证权限标识唯一性
export function verifyAuthSign(authSign,authId){
  return fetch({
    url:'/authority/existAuthSign',
    method:'get',
    params: {authSign:authSign,id:authId}
  })
}

//获取所有权限树级联
export function getAllAuthority(authId){
  return fetch({
    url:'/authority/List',
    method:'post',
    data: Qs.stringify({authId:authId})
  })
}


