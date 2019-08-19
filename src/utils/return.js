// 转化为数组
export function toArray(data){
    if(data==null){
      data=[]
    }else{
      data=data.split(",")
    }
    return data
}
// 转化为字符串
export function toString(data){
    if(data.length>0){
      data=data.join(",")
    }else{
      data=''
    }
    return data
}
// 转化为空
export function toVoid(data){
    if(data=="undefined"||data=="null"){
      data=''
    }
    return data
}