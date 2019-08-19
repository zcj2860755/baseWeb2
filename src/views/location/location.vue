<template>
  <div class="app-small" style="background:#fff;">
    <div class="location-list" :style="{height:treeHeight,width:listWidth}">
        <div class="suojin shousuo" v-if="treeBtn" @click="treeShow"></div>
        <div class="suojin zhankai" v-if="!treeBtn" @click="treeShow"></div>
        <div class="tree-search">
            <el-input placeholder="设备名称/姓名/卡号" @keyup.enter.native="devSearch" @keyup.enter="devSearch" v-model="filterText" clearable></el-input>
            <el-button type="primary" size="small" round @click="devSearch">查找</el-button>
        </div>
        <GeminiScrollbar class="tree-sortTree" :style="{height:sortTreeHeight}">
            <el-tree
                :data="sortData"
                :props="defaultProps"
                @check-change="handleCheckChange"
                :render-content="renderContent"
                default-expand-all
                v-show="!sortDataShow2">
            </el-tree>
<!-- :filter-node-method="filterNode" -->
            <el-tree
                id="locationTree"
                :props="defaultProps"
                :load="loadNode"
                lazy
                ref="sortTree"
                @node-click="handleCheckChange"
                @check-change="handleCheckChange"
                :render-content="renderContent"
                v-if="!sortDataShow">
            </el-tree>
        </GeminiScrollbar>
    </div>

    <div class="location-table" :style="{width:locTableWidth}">
        <div id="container" style="width:100%;" :style="{height:treeHeight}"></div>
        <div class="totalNum">定位总数：{{allCount}}台</div>
    </div>

  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {btnauth} from '@/components/Mixin/btnauth'
import { placeholderie } from '@/components/Mixin/placeholderie'
import { fixie9input } from '@/components/Mixin/fixie9input'
import {contractList,contractAdd,contractSubmit, contractInfo, contractDelete,updateGroupContract} from '@/api/mail'
// import {groupFind} from '@/api/group'
import {locationTree,locationPointDetail,locationPoint,locationCount,coordinate,groupInfo} from '@/api/location'
export default {
    components: {
    },
    data() {
        return {
            treeBtn:true,
            listWidth:'345px',
            locTableWidth:'calc(100% - 345px)',
            map:'',
            sortData:[],
            sortDataShow:true,
            sortDataShow2:true,
            lnglats:[],
            allCount:'',
            longitude:0.00,
            latitude:0.00,
            infoWindow:null,
            marker:'',
            tableHeight:' ',
            treeHeight:'',
            sortTreeHeight:'',
            isEdit:false,
            filterText: '',
            checkedIds:[],
            defaultProps: {
                label: 'name',
                children: 'childTSysGroup',
                isLeaf: 'isLeaf'
            },
            response:[],
            groupId:''
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],
    // watch: {
    //   filterText(val) {
    //     this.$refs.sortTree.filter(val);
    //   }
    // },
    created() {
        this.groupId=this.$store.state.user.groupId
        console.log(this.groupId)
        this.devSearch()
        this.locationCount(this.groupId)
        this.coordinate(this.groupId)
    },
    mounted() {
        // this.groupChange()
        this.devSearch()
        this.mapInit()
        // this.locationCount(this.groupId)
        let screenHeight=document.documentElement.clientHeight;
        this.treeHeight=screenHeight-130 +'px';
        this.sortTreeHeight=screenHeight-200 +'px';
        const that = this;
        window.onresize = function temp() {
            that.treeHeight = `${document.documentElement.clientHeight-130}px`;
            that.sortTreeHeight = `${document.documentElement.clientHeight-200}px`;
        };

    },
    methods: {
        treeShow(){
            this.treeBtn=!this.treeBtn
            if(!this.treeBtn){
                this.locTableWidth='calc(100% - 0px)'
                this.listWidth='0px'
            }else{
                this.locTableWidth='calc(100% - 345px)'
                this.listWidth='345px'
            }
        },
        devSearch() {
            if (this.filterText) {
            this.groupInfo()
            } else {
            this.groupChange()
            }
        },
        // 左侧设备查询
        groupInfo(){
            groupInfo(this.groupId,this.filterText).then(res=>{
                this.sortData=res.data
                this.sortDataShow=true
                this.sortDataShow2=false
            })
        },
        locationCount(id){
            locationCount(id).then(res=>{
                this.allCount=res.data.count
            })
        },
      coordinate(id){
        coordinate(id).then(res=>{
          this.longitude = res.data.longitude
          this.latitude  = res.data.latitude
          this.mapInit()
        })
      },
        groupChange(id){
            locationTree().then(response => {
                this.response[0]=response.data
                this.sortDataShow=false
                this.sortDataShow2=true
            })
        },
        loadNode(node, resolve) {
            if (node.level === 0) {
                setTimeout(() => {
                    return resolve(this.response[0]);
                }, 10);
            } else {
                this.getTreeChild(node.data.id, resolve)
            }

            // console.log(node)
        },
        getTreeChild(id, resolve){
            locationTree(id).then(response => {
                if(response.data){
                    var data=response.data
                   for(var i=0;i<data.length;i++){
                      var isLeaf = true ;
                    if(data[i].leafCount > 0  || data[i].count > 0){
                      isLeaf = false ;
                    }
                     data[i].isLeaf = isLeaf;
                  }
                    console.log(data)
                    resolve(data);
                }else{
                    resolve([]);
                }

            })
        },
        mapInit(ids){
            var that=this
            that.map = new AMap.Map("container", {
                resizeEnable: true,
                center: [this.longitude, this.latitude],
                zooms:[4,20],
            });
            that.infoWindow = new AMap.InfoWindow({
                anchor: 'middle-left',
                offset: new AMap.Pixel(10, -5)
            });
            if(ids){
                var id=ids.toString()
                console.log(id)
                locationPoint(id).then(res=>{
                    if(res.data){
                        that.lnglats=[]
                        var startIcon=new AMap.Icon({
                            image:require("../../assets/images/lo_blue.png"),
                            size:new AMap.Size(34,45),
                            imageSize:new AMap.Size(34,45)
                        })
                        for(var i=0;i<res.data.length;i++){
                            var arr=[]
                            arr[0]=res.data[i].longitudeGC
                            arr[1]=res.data[i].latitudeGC
                            that.lnglats.push(arr)
                        }
                        console.log(that.lnglats)


                        for (var i = 0, marker; i < res.data.length; i++) {
                            that.marker = new AMap.Marker({
                                icon: startIcon,
                                position: that.lnglats[i],
                                offset: new AMap.Pixel(-17, -22),
                                map:that.map
                            });
                            that.marker.setMap(that.map);
                            that.map.setFitView();
                            var content = res.data[i].id

                            that.marker.content = content;
                            that.marker.on('click', markerClick);
                            that.marker.on('click', updateMarker);
                        }
                    }
                })
            }

            // 关闭信息窗口
            that.map.on('click', closeInfoW)
            function closeInfoW() {
                that.infoWindow.close();
            }
            function markerClick(e) {
                // console.log(e.target.content)
                locationPointDetail(e.target.content).then(res=>{
                    let data=res.data
                    if(data){
                        let createTime=that.dateFormat2(data.createTime)
                        let content = "<div class='window'><div class='header'><h2>"+data.groupName+"</h2><h3>"
                            +data.deviceName+"</h3></div><ul><li><span>联系人</span><em>"+
                            data.name+"【"+data.tel+"】</em></li><li><span>北斗民用IC卡号</span><em>"+
                            data.icCard+"</em><li><span>最新地址</span><em>"+
                            data.address+"<br/>（POS:"+data.longitude.toFixed(4)+"，"+data.latitude.toFixed(4)+"）</em></li><li><span>设备时间</span><em>"+
                            createTime+"</em></li></ul><div class='foot'><a id='toTarck'>历史轨迹</a></div></div>";
                        that.infoWindow.setContent(content);
                        that.infoWindow.open(that.map, e.target.getPosition());
                        setTimeout(()=>{
                            document.getElementById("toTarck").addEventListener("click", function(){
                                that.$router.push({path:"/location/track?deviceCode="+data.deviceCode+"&id="+data.id+"&deviceName="+data.deviceName})
                            })
                        },10)
                    }

                })


            }

            function updateMarker(e) {
                let icon1,icon2
                icon2 =require("../../assets/images/lo_red.png")
                self.selectedMarkerStore = e.target.getExtData()
                if (self.lastClickedMarker) {
                    let icon = self.lastClickedMarker.getIcon()
                    icon1 =require("../../assets/images/lo_blue.png")
                    self.lastClickedMarker.setIcon(
                        new AMap.Icon({
                            size: new AMap.Size(34,45),    // 图标尺寸
                            image: icon1,  // Icon的图像
                            imageSize: new AMap.Size(34,45)
                        })
                    )
                }
                e.target.setIcon(
                    new AMap.Icon({
                        size: new AMap.Size(34,45),    // 图标尺寸
                        image: icon2,  // Icon的图像
                        imageSize: new AMap.Size(34,45)
                    })
                )
                self.lastClickedMarker = e.target
            }
        },
        // 查找通讯录
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        // tree选中
        handleCheckChange(data, checked, indeterminate) {
            var getChecked=this.$refs.sortTree.getCheckedNodes()
            // console.log(data)

        },
        checkNode(data){
            // console.log(data.data.enable)
            data.data.enable=!data.data.enable
            // console.log(this.$refs.sortTree.getCheckedKeys());
            if(data.data.enable==true){
                var index1 = this.checkedIds.indexOf(data.data.id+'&'+data.data.device);
                if (index1 > -1) {
                    this.checkedIds.splice(index1, 1);
                }
                for(var i=0;i<data.childNodes.length;i++){
                    data.childNodes[i].data.enable=true
                    var index = this.checkedIds.indexOf(data.childNodes[i].data.id+'&'+data.childNodes[i].data.device);
                    if (index > -1) {
                        this.checkedIds.splice(index, 1);
                    }
                    // this.checkedIds.remove(data.childNodes[i].data.id)
                    // this.checkedIds.push(data.childNodes[i].data.id)
                    // console.log(data.childNodes[i].data.enable)
                }
                this.uniq(this.checkedIds)
                // console.log( this.checkedIds)
            }else{
                // console.log(data.data)
                this.checkedIds.push(data.data.id+'&'+data.data.device);

                for(var i=0;i<data.childNodes.length;i++){
                    data.childNodes[i].data.enable=false
                    // console.log(data.childNodes[i].data.enable)
                    this.checkedIds.push(data.childNodes[i].data.id+'&'+data.childNodes[i].data.device)
                    // this.deviceCodes
                }
                this.uniq(this.checkedIds)
                // console.log( this.checkedIds)
            }
            this.mapInit(this.checkedIds)
        },
        //自定义内容
        renderContent(h, { node, data }) {
            // console.log(node)
            return (
                <span class="custom-tree-node">
                    <div class='block' on-click={()=>this.checkNode(node)} hidden={!data.selected}>
                        <div></div>
                        <span v-show={!data.enable} ></span>
                    </div>
                    <span style='float:left'>{(data.count == 0 ? data.name : (data.name  + "【"+data.count+"】"))}</span>
                </span>
            );
            // <el-checkbox v-model={!data.selected} on-change={()=>this.checkNode(node)} checked={data.selected} />
        },
        // 数组去重
        uniq(array){
            var temp = []; //一个新的临时数组
            for(var i = 0; i < array.length; i++){
                if(temp.indexOf(array[i]) == -1){
                    temp.push(array[i]);
                }
            }
            return temp;
        },
        dateFormat2(value) {
            return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "";
        },
    }
}
</script>
<style lang="scss">
.location-list{
    float: left;
    width: 345px;
    height: 200px;
    background-color: #fff;
    // border-right: 1px solid #dcdfe6;
    position: relative;
    .suojin{
        position: absolute;
        z-index: 11;
        right: -24px;
        top: 20%;
        width: 24px;
        height: 43px;
        cursor: pointer;
    }
    .shousuo{
        background: url("../../assets/images/shousuo.png") no-repeat;
        background-size: 100%;
    }
    .zhankai{
        background: url("../../assets/images/zhankai.png") no-repeat;
        background-size: 100%;
    }
    .tree-sortTree{
        width: 100%;
        overflow-y: auto;
        position: absolute;
        z-index: 1;
        top: 50px;
        z-index: 3;
        font-size: 12px;
        .el-tree{
            background: none;
            width: 100%;
            overflow: hidden;
        }
    }
    .byList{
        position: absolute;
        z-index: 1;
        top: 60px;
        left: 0;
        list-style: none;
        margin: 0;
        padding: 0;
        width: 345px;
        li{
            height: 40px;
            line-height: 40px;
        }
        li:nth-child(odd){
            background-color: #F4F8FC;
        }
        li:nth-child(even){
            background-color: #fff;
        }
    }
    .tree-search{
        background: #F1F3F5;
        padding: 10px 10px;
        .el-input{
            width: 240px;
            margin-right: 10px;
        }
        input{
            height: 30px;
            line-height: 30px;
            border: 0;
            text-align: center;
        }
    }

}
.location-table{
    width:  calc(100% - 345px);
    float: left;
    position: relative;
    .totalNum{
        position: absolute;
        z-index: 5;
        top: 10px;
        right: 10px;
        height: 50px;
        text-align: center;
        line-height: 50px;
        background: #fff;
        border-radius: 2px;
        padding: 0 15px;
        font-size: 14px;
    }
    #container{
        color: #282828;
        .amap-info-content{
            padding: 0;
            border-radius: 6px;
        }
        .amap-info-close{
            right: 6px!important;
        }
        .window{
            .header{
                margin: 10px 10px 0 10px;
                line-height: 25px;
                border-bottom: 1px solid rgba(85,85,85,0.1);
                h2{
                    font-size: 14px;
                    margin: 0;
                }
                h3{
                    font-size: 12px;
                    font-weight: normal;
                    margin: 0;
                }
            }
            ul{
                margin: 0;
                padding: 6px 10px;
                li{
                    overflow: hidden;
                    font-size: 12px;
                    line-height: 20px;
                    width: 310px;
                    span{
                        float: left;
                        width: 90px;
                    }
                    em{
                        float: left;
                        width: 220px;
                        font-style: normal;
                    }
                }
            }
            .foot{
                padding-left: 10px;
                background-color: #F1F3F5;
                height: 44px;
                line-height: 44px;
                font-size: 14px;
                color: #2975E6;
                cursor: pointer;
            }
        }

    }
}
.block{
    position: relative;
    float: left;
    margin-top: 11px;
    margin-right: 6px;

    overflow: hidden;
    div{
        width: 14px;
        height: 14px;
        border: 1px solid #dcdfe6;
        border-radius:2px;
    }
    span{
        display: block;
        position: absolute;
        z-index: 2;
        top: 0;
        left: 0;
        width: 14px;
        height: 14px;
        border: 1px solid #dcdfe6;
        border-radius:2px;
        background-color: #2975E6;
    }
    span:after{
        -webkit-transform: rotate(45deg) scaleY(1);
        transform: rotate(45deg) scaleY(1);
        content: "";
        box-sizing: content-box;
        border: 1px solid #fff;
        border-left: 0;
        border-top: 0;
        height: 7px;
        left: 4px;
        position: absolute;
        top: 1px;
        width: 3px;
        -webkit-transition: -webkit-transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms;
        transition: -webkit-transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms;
        transition: transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms;
        transition: transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms, -webkit-transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms;
        transition: transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms,-webkit-transform .15s cubic-bezier(.71,-.46,.88,.6) 50ms;
        -webkit-transform-origin: center;
        transform-origin: center;
    }
}

#locationTree{
    .el-tree-node__content{
        width: 200%;
    }
}
</style>
