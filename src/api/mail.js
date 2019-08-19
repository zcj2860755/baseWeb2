import fetch from '@/utils/fetch'
import Qs from 'qs'

//通讯录分页查询
export  function contractList(params){
    return fetch({
        url:'/contract',
        method:'get',
        params:{
            contractGroupId:params.contractGroupId,
            keyWord:params.keyWord,
            pageNo:params.pageNo,
            pageSize:params.pageSize
        }
    })
}

 //通讯录新增
 export  function contractAdd(params){
    return fetch({
        url:'/contract',
        method:'post',
        params:{
            name:params.name,
            contractNum :params.contractNum,
            contractGroupId :params.contractGroupId
        }
    })
}

 //通讯录更新提交
 export  function contractSubmit(params){
    return fetch({
        url:'/contract',
        method:'put',
        params:{
            name:params.name,
            contractNum :params.contractNum,
            contractGroupId :params.contractGroupId,
            id:params.id
        }
    })
}

 //通讯录分页删除
 export  function contractDelete(ids){
    return fetch({
        url:'/contract/delete',
        method:'delete',
        params:{
            ids:ids
        }
    })
}

 //通讯录分页详情
 export  function contractInfo(id){
    return fetch({
        url:'/contract/info',
        method:'get',
        params:{
            id:id
        }
    })
}

 //批量更新联系人分组
 export  function updateGroupContract(params){
    return fetch({
        url:'/contract/updateGroupContract',
        method:'put',
        params:{
            groupId:params.groupId,
            ids :params.ids
        }
    })
}

 //通讯录分组查询，树,未分配组的用户聚合为指定分组
 export function findListByTreeTogether(params) {
    return fetch({
        url: '/contract/group/findListByTreeTogether',
        method: 'get'
    })
 }

 //通讯录分组分页查询
export  function conGroupList(params){
    return fetch({
        url:'/contract/group',
        method:'get',
        params:{
            pageNo:params.pageNo,
            pageSize:params.pageSize
        }
    })
}

 //通讯录分组新增
 export  function conGroupAdd(params){
    return fetch({
        url:'/contract/group',
        method:'post',
        params:{
            groupName:params.groupName
        }
    })
}

 //通讯录分组更新提交
 export  function conGroupSubmit(params){
    return fetch({
        url:'/contract/group',
        method:'put',
        params:{
            groupName:params.groupName,
            id:params.id
        }
    })
}

 //通讯录分组分页删除
 export  function conGroupDelete(ids){
    return fetch({
        url:'/contract/group/delete',
        method:'delete',
        params:{
            ids:ids
        }
    })
}

 //通讯录分组分页详情
 export  function conGroupInfo(id){
    return fetch({
        url:'/contract/group/info',
        method:'get',
        params:{
            id:id
        }
    })
}