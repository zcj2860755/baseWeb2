import fetch from '@/utils/fetch'
import Qs from 'qs'

//权限列表
export function authList(params) {
  return fetch({
    url: 'base/authority/getAllAuthList',
    method: 'get',
    params:{
        pageNo:params.pageNo,
        pageSize:params.pageSize,
        keyword:params.keyword,
        id:params.id,
        authTypeBlack:params.authTypeBlack
    }
  })
}

//删除权限
export function deleteAuth(id) {
  return fetch({
    url: 'base/authority/'+id,
    method: 'delete'
  })
}


 //获取所有角色路由
 export function getRoleAuthAll () {
  return fetch({
    url: 'base/authority/List',
    method: 'post'
  })
}


//新增时默认权限列表（首页）
export  function defaultAuth(params){
  return fetch({
    url:'base/authority/defaultAuth',
    method:'get'
  })
}




