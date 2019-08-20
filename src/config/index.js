const ip="192.168.1.201:8099"//朱
//const ip="192.168.1.226:8695"//张
//const ip="114.55.10.15:8695"//测试服

const config={
  ip:"http://"+ip,
  uploadImageUrl:"http://"+ip+"/image",//上传图片接口
  ossUrl:"http://zdzc-ddc.oss-cn-hangzhou.aliyuncs.com/",//阿里OSS地址
  webSocketUrl:"ws://"+ip+"/websocket/"
}


export default config
