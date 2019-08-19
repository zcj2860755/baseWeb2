import fetch from '@/utils/fetch'
import Qs from 'qs'

 //编辑组织
 export function editOrg(orgId){
   return fetch({
     url:'/organization/detail',
     method:'post',
     data: Qs.stringify({orgId:orgId})
   })
 }

 //保存组织
 export function submitOrg (params){
  return fetch({
    url:'/organization/submit',
    method:'post',
    params
  })
 }

//验证组织标识唯一性
export function verifyOrgCode(orgCode){
  return fetch({
    url:'/organization/existOrgCode',
    method:'post',
    data: Qs.stringify({orgCode:orgCode})
  })
}

//验证同一组织机构下组织名称唯一性
export function verifyOrgName(orgName){
  return fetch({
    url:'/organization/existOrgName',
    method:'post',
    data: Qs.stringify({orgName:orgName})
  })
}


