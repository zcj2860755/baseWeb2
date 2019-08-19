import fetch from '@/utils/fetch'
import Qs from 'qs'

//设备终端列表
export function getDeviceList(params) {
  return fetch({
    url: '/device',
    method: 'get',
    params: { //请求参数
      searchContent: params.searchContent,
      groupId: params.groupId,
      deviceType: params.deviceType,
      pageNo: params.pageNo,
      pageSize: params.pageSize
    }
  })
}

//设备终端详情
export function getDeviceInfoById(params) {
  return fetch({
    url: '/device/info',
    method: 'get',
    params: { //请求参数
      id: params
    }
  })
}


//设备终端新增
export function addDeviceInfo(params) {
  return fetch({
    url: '/device',
    method: 'post',
    params: { //请求参数
      name: params.name,
      belongName:params.belongName,
      deviceCode: params.deviceCode,
      deviceName: params.deviceName,
      deviceType: params.deviceType,
      deviceModel: params.deviceModel,
      tel: params.tel,
      areaId: params.areaId,
      address: params.address,
      icCardId: params.icCardId,
      groupId: params.groupId
    }
  })
}


//设备终端新增
export function editDeviceInfo(params) {
  return fetch({
    url: '/device',
    method: 'put',
    params: { //请求参数
      id: params.id,
      name: params.name,
      belongName:params.belongName,
      deviceCode: params.deviceCode,
      deviceName: params.deviceName,
      deviceType: params.deviceType,
      deviceModel: params.deviceModel,
      tel: params.tel,
      areaId: params.areaId,
      address: params.address,
      icCardId: params.icCardId,
      groupId: params.groupId
    }
  })
}


//设备终端删除
export function deleteDevice(params) {
  return fetch({
    url: '/device/delete',
    method: 'delete',
    params: { //请求参数
      ids: params
    }
  })
}
