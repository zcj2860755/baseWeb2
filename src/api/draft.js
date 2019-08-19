import fetch from '@/utils/fetch'
import Qs from 'qs'


//草稿箱列表
export function getMsgDraftList(params) {
  return fetch({
    url: 'msg/draft',
    method: 'get',
    params: { //请求参数
      keyWord: params.keyword,
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      beginTime: params.beginTime,
      endTime: params.endTime
    }
  })
}


//删除草稿
export function deleteMsgDraft(params) {
  return fetch({
    url: 'msg/draft/delete',
    method:'delete',
    params: { //请求参数
      ids: params
    }
  })
}

//新增草稿
export function addMsgDraft(params) {
  return fetch({
    url: 'msg/draft',
    method:'post',
    params: { //请求参数
      id:params.id,
      msgType:params.msgType,
      receivedInfo:params.receivedInfo,
      content:params.content,
      sendPersons:params.sendPersons
    }
  })
}

