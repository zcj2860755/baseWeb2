import fetch from '@/utils/fetch'
import Qs from 'qs'

//下拉框多级联动获取
export function groupSelect(id) {
    return fetch({
        url: '/base/project/findList',
        method: 'get',
        params:{
            id:id
        }
    })
}


//下拉框编辑获取
export function groupSelectEdit(id) {
    return fetch({
        url: '/base/project/edit/findList',
        method: 'get',
        params:{
            id:id
        }
    })
}

//分页查询
export function groupList(params) {
    return fetch({
        url: '/base/project',
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
        url: '/base/project',
        method: 'post',
        params
    })
}
//更新
export function groupEdit(params) {
    return fetch({
        url: '/base/project',
        method: 'put',
        params
    })
}
//删除
export function groupDelete(id) {
    return fetch({
        url: '/base/project/'+id,
        method: 'delete'
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


//项目详情
export function projectInfo(projectId){
  return fetch({
    url:'/base/project/'+projectId,
    method:'get'
  })
}
