import fetch from '@/utils/fetch'

//指挥机列表
export function getCommandCardList(params) {
  return fetch({
    url: 'command/card',
    method: 'get',
    params: { //请求参数
      keyWord: params.keyWord,
      pageNo: params.pageNo,
      pageSize: params.pageSize
    }
  })
}


//新增指挥机
export function addCommandCard(params) {
  return fetch({
    url: 'command/card',
    method: 'post',
    params: { //请求参数
      ip: params.ip,
      icCode: params.icCode,
      name: params.name,
      curTimer: params.curTimer,
      enableFlag: params.enableFlag,
      randomFlag: params.randomFlag,
      remark: params.remark
    }
  })
}


//指挥机详情
export function commandCardInfo(id) {
  return fetch({
    url: 'command/card/info',
    method: 'get',
    params: { //请求参数
      id: id
    }
  })
}

//删除指挥机
export function deleteCommandCard(id) {
  return fetch({
    url: 'command/card/delete',
    method: 'delete',
    params: { //请求参数
      id: id
    }
  })
}

//修改指挥机
export function editCommandCard(params) {
  return fetch({
    url: 'command/card',
    method: 'put',
    params: { //请求参数
      id: params.id,
      ip: params.ip,
      icCode: params.icCode,
      name: params.name,
      curTimer: params.curTimer,
      enableFlag: params.enableFlag,
      randomFlag: params.randomFlag,
      remark: params.remark
    }
  })
}

