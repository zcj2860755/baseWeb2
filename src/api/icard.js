import fetch from '@/utils/fetch'
import Qs from 'qs'

//ic卡列表
export function getCardList(params) {
  return fetch({
    url: '/card',
    method: 'get',
    params: { //请求参数
      searchContent: params.searchContent,
      groupId: params.groupId,
      createBeginTime: params.beginTime,
      createEndTime: params.endTime,
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      dueDate:params.dueDate
    }
  })
}


//删除IC卡
export function deleteICCard(params) {
  return fetch({
    url: '/card/delete',
    method: 'delete',
    params: { //请求参数
      ids:params
    }
  })
}


//ic卡列表
export function addCardList(params) {
  return fetch({
    url: '/card',
    method: 'post',
    params: { //请求参数
      groupId:params.groupId,
      belongName:params.belongName,
      centerIcCode: params.centerIcCode,
      icCode:params.icCode,
      tel:params.tel,
      areaId:params.areaId,
      address:params.address,
      serviceType:params.serviceType,
      endTime:params.endTime,
      authType:params.authType,
      idcard:params.idcard,
      idcardFrontPic:params.idcardFrontPic,
      idcardReversePic:params.idcardReversePic,
      legalBoss:params.legalBoss,
      orgCertCode:params.orgCertCode,
      businessPic:params.businessPic
    }
  })
}



//IC卡详情
export function getICCardInfo(params) {
  return fetch({
    url: '/card/info',
    method: 'get',
    params: { //请求参数
      id:params
    }
  })
}


//ic卡列表
export function editCardList(params) {
  return fetch({
    url: '/card',
    method: 'put',
    params: { //请求参数
      id:params.id,
      groupId:params.groupId,
      belongName:params.belongName,
      centerIcCode: params.centerIcCode,
      icCode:params.icCode,
      tel:params.tel,
      areaId:params.areaId,
      address:params.address,
      serviceType:params.serviceType,
      endTime:params.endTime,
      authType:params.authType,
      idcard:params.idcard,
      idcardFrontPic:params.idcardFrontPic,
      idcardReversePic:params.idcardReversePic,
      legalBoss:params.legalBoss,
      orgCertCode:params.orgCertCode,
      businessPic:params.businessPic
    }
  })
}

//IC卡详情
export function getICCardByBind(params) {
  return fetch({
    url: '/card/getICCardByBind',
    method: 'get',
    params: { //请求参数
      deviceId:params
    }
  })
}


//IC卡解绑
export function iCardUntying(params) {
  return fetch({
    url: '/card/iCardUntying',
    method: 'post',
    params: { //请求参数
      ids:params
    }
  })
}

