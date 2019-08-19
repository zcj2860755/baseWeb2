import fetch from '@/utils/fetch'
import Qs from 'qs'

//首页接口
export function getIndex(params) {
  return fetch({
    url: 'index',
    method: 'get',
    params: { //请求参数
      beginTime: params.beginTime,
      endTime : params.endTime
    }
  })
}
