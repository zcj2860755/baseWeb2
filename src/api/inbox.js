import fetch from '@/utils/fetch'
import Qs from 'qs'

//收件箱分页查询
 export  function inboxList(params){
    return fetch({
        url:'/msg/received',
        method:'get',
        params:{
            keyWord:params.keyWord,
            beginTime:params.beginTime,
            endTime:params.endTime,
            sosFlag:params.sosFlag,
            pageNo:params.pageNo,
            pageSize:params.pageSize,
        }
    })
}


 //收件箱分页删除
 export  function inboxDelete(ids){
    return fetch({
        url:'/msg/received/delete',
        method:'delete',
        params:{
            ids:ids
        }
    })
}

 //收件箱分页详情
 export  function inboxInfo(id){
    return fetch({
        url:'/msg/received/info',
        method:'get',
        params:{
            id:id
        }
    })
}


//收件箱批量已读
export  function inboxRead(ids){
  return fetch({
    url:'/msg/received/read',
    method:'put',
    params:{
      ids:ids
    }
  })
}


//收件箱未读数量统计
export  function inboxunRead(){
  return fetch({
    url:'/msg/received/unread',
    method:'put'
  })
}
