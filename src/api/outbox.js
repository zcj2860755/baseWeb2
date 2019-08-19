import fetch from '@/utils/fetch'
import Qs from 'qs'



//发送消息
export function outboxSend(params){
    return fetch({
        url:'/msg/send',
        method:'post',
        params:{
            draftId:params.draftId,
            receivedIp:params.receivedIp,
            receivedInfos:params.receivedInfos,
            content:params.content,
            sendPersons:params.sendPersons
        }
    })
}


 //短信模板分页查询
export  function templateList(params){
    return fetch({
        url:'/msg/template',
        method:'get',
        params:{
            templateType:params.templateType,
            keyWord:params.keyWord,
            pageNo:params.pageNo,
            pageSize:params.pageSize,
        }
    })
}

 //短信模板新增
 export  function templateAdd(params){
    return fetch({
        url:'/msg/template',
        method:'post',
        params:{
            templateType:params.templateType,
            content :params.content
        }
    })
}

 //短信模板更新提交
 export  function templateSubmit(params){
    return fetch({
        url:'/msg/template',
        method:'put',
        params:{
            templateType:params.templateType,
            content:params.content,
            id:params.id
        }
    })
}

 //短信模板分页删除
 export  function templateDelete(ids){
    return fetch({
        url:'/msg/template/delete',
        method:'delete',
        params:{
            ids:ids
        }
    })
}

 //短信模板分页详情
 export  function templateInfo(id){
    return fetch({
        url:'/msg/template/info',
        method:'get',
        params:{
            id:id
        }
    })
}


//短信模板分页详情
export  function getContract(name){
  return fetch({
    url:'contract/getContractList',
    method:'get',
    params:{
      name:name
    }
  })
}





