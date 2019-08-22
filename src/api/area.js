import fetch from '@/utils/fetch'
import Qs from 'qs'

//下拉框多级联动获取
export function areaSelect(id) {
    return fetch({
        url: '/area/selectProvinceCityAreaList',
        method: 'get',
        params:{
            id:id
        }
    })
}


//下拉框编辑获取
export function areaSelectEdit(id) {
    return fetch({
        url: '/sys/area/selectAreaInfoById',
        method: 'get',
        params:{
            id:id
        }
    })
}



