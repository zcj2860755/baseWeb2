import fetch from '@/utils/fetch'
import Qs from 'qs'
// 下拉框多级联动获取
export function locationTree (id) {
    return fetch({
        url: '/device/location/select',
        method: 'get',
        params: { //请求参数
            id: id
        }
    })
}
// 获取当前设备的实时位置详情
export function locationPointDetail (id) {
    return fetch({
        url: '/device/location/info',
        method: 'get',
        params: { //请求参数
            id: id
        }
    })
}

// 获取设备的实时位置信息
export function locationPoint (deviceCodes) {
    return fetch({
        url: '/device/location/locationInfo',
        method: 'get',
        params: { //请求参数
            deviceCodes: deviceCodes
        }
    })
}

// 获取该用户分组权限下的设备数量
export function locationCount (groupId) {
    return fetch({
        url: '/device/location/count',
        method: 'get',
        params: { //请求参数
            groupId : groupId
        }
    })
}


// 获取该用户分组权限下的设备历史轨迹信息
export function devicetrial (params) {
    return fetch({
        url: '/device/location/devicetrial',
        method: 'get',
        params: { //请求参数
            deviceCode: params.deviceCode,
            beginTime: params.beginTime,
            endTime: params.endTime
        }
    })
}

// 获取历史轨迹信息初始化时间
export function trialGetTime (deviceCode) {
    return fetch({
        url: '/device/location/getTime',
        method: 'get',
        params: { //请求参数
            deviceCode: deviceCode
        }
    })
}


// 获取历史轨迹的实时位置详情
export function trialinfo (id) {
    return fetch({
        url: '/device/location/trialinfo',
        method: 'get',
        params: { //请求参数
            id: id
        }
    })
}

// 获取该用户分组权限下的设备信息/条件查询接口
export function groupInfo (groupId,searchContent) {
    return fetch({
        url: '/device/location/groupInfo',
        method: 'get',
        params: { //请求参数
            groupId: groupId,
            searchContent:searchContent
        }
    })
}

// 获取该用户分组的坐标
export function coordinate (groupId) {
  return fetch({
    url: '/device/location/coordinate',
    method: 'get',
    params: { //请求参数
      groupId : groupId
    }
  })
}
