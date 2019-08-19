import fetch from '@/utils/fetch'
import Qs from 'qs'


//已发送列表
export function getSendMsgList(params) {
  return fetch({
    url: '/msg/send',
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


//删除已发送信息
export function deleteSendMsg(params) {
  return fetch({
    url: '/msg/send/delete',
    method:'delete',
    params: { //请求参数
      ids: params
    }
  })
}
