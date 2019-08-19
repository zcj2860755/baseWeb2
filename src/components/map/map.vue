<template>
    <div class="outline-map"> 
        <div class="button-track" @click="vehicleTrack">车辆轨迹</div>
        <div class="button-locate" @click="vehicleLocal">车辆定位</div>
        <div id="container" ref="alarmap"></div>
    </div>
</template>
<script>
export default {
    name:'Map',
    props:{
        markerArr:{
            type: Array,
            required:true
        }
    },
    data(){
        return{
            
        }
    },
    created(){

    },
    methods:{
        init(){
            var map = new BMap.Map("container",{
                minZoom : 5,  
                maxZoom : 16 
            });
            var point = new BMap.Point(116.974667,33.663368);  // 创建点坐标  
            map.centerAndZoom(point,8);               // 初始化地图，设置中心点坐标和地图级别  
            map.enableScrollWheelZoom();  //启用滚轮放大缩小  
        },
        vehicleTrack(){
            var map = new BMap.Map("container");
            var point = new BMap.Point(116.974667,33.663368);
            var sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_CLOSED_ARROW, {
                scale: 1,//图标缩放大小
                fillColor:'#c5fff2',
                fillOpacity:1,
                strokeColor:'#368c6e',//设置矢量图标的线填充颜色
                strokeWeight: '1',//设置线宽
            });
            var icons = new BMap.IconSequence(sy, '10', '50');
            // 轨迹
            let polyline = new BMap.Polyline([
                new BMap.Point(116.564366,34.0171),
                new BMap.Point(116.771336,33.604359),
                new BMap.Point(117.215171,33.585113),
                new BMap.Point(117.272662,33.355752),
                new BMap.Point(117.263463,33.067707),
                new BMap.Point(116.644854,33.205083)
            ], {
                enableEditing: false,//是否启用线编辑，默认为false
                enableClicking: true,//是否响应点击事件，默认为true
                icons:[icons],
                strokeColor: "#4096d1", //线颜色
                strokeOpacity: 1,       //线透明度
                strokeWeight: 3,        //线宽
                strokeStyle: "solid",    //线样式
                showDir: true
            });
            map.addOverlay(polyline);
            map.centerAndZoom(point, 8);               // 初始化地图，设置中心点坐标和地图级别  
            map.enableScrollWheelZoom();  //启用滚轮放大缩小  
        },
        vehicleLocal(){   
            
            var map = new BMap.Map("container");
            var data = this.markerArr;
            var markerArr = [];
            for(var index in data){
                var item =data[index];
                var point = new BMap.Point(item.lng, item.lat);
                var iconimg = new BMap.Icon("../../static/images/local-icon.png", new BMap.Size(30,49));
                var marker = new BMap.Marker(point,{icon:iconimg});
                map.addOverlay(marker);
                map.enableScrollWheelZoom();  //启用滚轮放大缩小 
                markerArr.push(point);
               
            }
            map.centerAndZoom(point, 8); 
            //根据地图上添加的覆盖物分布情况，自动缩放地图到合适的视野级别
            map.setViewport(markerArr);
            console.log(markerArr)
        },
        getAll(){
            
        }

    },
    mounted() {
        this.init();
        let screenHeight=document.documentElement.clientHeight;
        this.$refs.alarmap.style.height = screenHeight-102 +'px';

    }
}
</script>

<style scoped lang="scss">
#container{
    width: 100%;
    height: 100%;
}
.outline-map{
    position: relative;
    @mixin btn{
      position: absolute;
      z-index: 2;
      right: 20px;
      width: 88px;
      height: 30px;
      line-height: 30px;
      color: #fff;
      font-size: 13px;
      text-align: center;
      border-radius: 2px;
    }
    .button-track{
      @include btn;
      top: 10px;
      background: #659be0;
      
    }
    .button-locate{
      @include btn;
      top: 50px;
      background: #ed6b75;
    }
}

</style>


