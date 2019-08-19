import fetch from '@/utils/fetch'
import Qs from 'qs'

//下拉框多级联动获取
export function groupSelect(id) {
    return fetch({
        url: '/sys/group/select',
        method: 'get',
        params:{
            id:id
        }
    })
}


//下拉框编辑获取
export function groupSelectEdit(id) {
    return fetch({
        url: '/sys/group/edit',
        method: 'get',
        params:{
            id:id
        }
    })
}

//分页查询
export function groupList(params) {
    return fetch({
        url: '/sys/group',
        method: 'get',
        params:{
            id:params.id,
            searchContent:params.searchContent,
            pageNo:params.pageNo,
            pageSize:params.pageSize,
        }
    })
}
//新增
export function groupAdd(params) {
    return fetch({
        url: '/sys/group',
        method: 'post',
        params:{
            parentId:params.parentId,
            name :params.name
        }
    })
}
//更新
export function groupEdit(params) {
    return fetch({
        url: '/sys/group',
        method: 'put',
        params:{
            id:params.id,
            parentId:params.parentId,
            name :params.name
        }
    })
}
//删除
export function groupDelete(id) {
    return fetch({
        url: '/sys/group/delete',
        method: 'delete',
        params:{
            id:id
        }
    })
}


//树状数据集合
export function groupFind(id) {
    return fetch({
        url: '/sys/group/find',
        method: 'get',
        params:{
            id:id
        }
    })
}