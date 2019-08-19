import fetch from '@/utils/fetch'
import Qs from 'qs'

export function getArea (params) {
  return fetch({
    url: '/area/restrictAreaJson',
    method: 'post',
      data: Qs.stringify({ areaId: params.areaId })
  })
}
// 查找账号下所有的组织列表接口
export function findAllChildOrgByAccount (orgId,accountId) {
  return fetch({
    url: '/organization/findAllChildOrgByAccount',
    method: 'post',
      data: Qs.stringify({ accountId: accountId,orgId:orgId })
  })
}

export function echoAreaJson (params) {
  return fetch({
    url: '/area/echoAreaJson',
    method: 'post',
    data: Qs.stringify({ areaId: params.areaId})
  })
}

//组织列表
export function orgList (params) {
  return fetch({
    url: '/organization/list',
    method: 'post',
      data:Qs.stringify({ keyword: params.keyword,orgType: params.orgType,areaId: params.areaId,pageNo: params.pageNo,pageSize: params.pageSize})
  })
}

//删除组织
export  function deleteOrg(params){
  return fetch({
    url:'/organization/delete',
    method:'post',
     data:Qs.stringify({ids:params})
  })
}

