import fetch from '@/utils/fetch'
import Qs from 'qs'

//类别列表
export function dictionaryList(params) {
    return fetch({
        url: '/base/dic/category/pageList',
        method: 'post',
        params: { //请求参数
            keyWords : params.keyWords,
            pageNo: params.pageNo,
            pageSize: params.pageSize
        }
    })
}

//类别编辑
export function detailCategory(categoryId) {
    return fetch({
        url: '/base/dic/category/findById',
        method: 'get',
        data: Qs.stringify({categoryId:categoryId}),
        params:{
            id:categoryId
        }
    })
}

//类别编辑提交
export function submitCategory(params) {
    return fetch({
        url: '/base/dic/category',
        method: 'put',
        params
    })
}

//新增字典类别
export function submitAddCategory(params) {
    return fetch({
        url: '/base/dic/category',
        method: 'post',
        params
    })
}

//类别删除
export function deleteCategory(params) {
    return fetch({
        url: '/base/dic/category',
        method: 'delete',
        data: Qs.stringify({ids: params}),
        params:{
          id:params
        }
    })
}

//字典列表
export function dictionaryListDic(categoryId) {
    return fetch({
        url: '/base/dic/pageList',
        method: 'post',
        data: Qs.stringify({categoryId:categoryId}),
        // params:{
        //     categoryId:categoryId
        // }
    })
}

//字典参数列表
export function dictionaryListDicByParent(params) {
  return fetch({
    url: '/base/dic/getDicByDicKey',
    method: 'get',
    params:{
      dicKey:params.parentKey
    }
  })
}


//字典新增
export function addDic(params) {
    return fetch({
        url: '/base/dic',
        method: 'post',
        params
    })
}

//字典编辑
export function detailDic(dicId) {
    return fetch({
        url: '/base/dic/findById',
        method: 'get',
        data: Qs.stringify({dicId:dicId}),
        params:{
            id:dicId
        }
    })
}
//字典提交
export function submitDic(params) {
    return fetch({
        url: '/base/dic',
        method: 'put',
        params
    })
}
//字典删除
export function deleteDic(params) {
    return fetch({
        url: '/base/dic',
        method: 'delete',
        data: Qs.stringify({ids: params}),
        params:{
          id:params
        }
    })
}

//字典列表刷新按钮
export function refresh() {
    return fetch({
        url: '/dictionary/refresh',
        method: 'post'
    })
}
//字典列表获取所有字典集合下拉框
export function dictionaryGetAll() {
    return fetch({
        url: '/dictionary/getAll',
        method: 'post'
    })
}
//字典列表根据类别key获取字典下拉框
export function dictionaryGetDic(params) {
    return fetch({
        url: '/dictionary/getDic',
        method: 'post',
        data: Qs.stringify({key: params})
    })
}


//获取所有字典集合接口
export function getAllDic() {
    return fetch({
        url: '/sys/dicCategory/getAllDics',
        method: 'get'
    })
}




//启用禁用
export function enableCategory(params) {
    return fetch({
        url: '/dictionary/enableCategory',
        method: 'post',
        params: { //请求参数
            id: params.id,
            enable:params.enable
        }
    })
}

