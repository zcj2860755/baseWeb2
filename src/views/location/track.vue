<template>
  <div class="app-small" style="background:#fff;">
    <div class="location-list" :style="{height:treeHeight,width:listWidth}">
        <div class="suojin shousuo" v-if="treeBtn" @click="treeShow"></div>
        <div class="suojin zhankai" v-if="!treeBtn" @click="treeShow"></div>
        <div class="tree-search">
            <el-input placeholder="设备名称/姓名/卡号"  @keyup.enter.native="devSearch" @keyup.enter="devSearch"  v-model="filterText" clearable></el-input>
            <el-button type="primary" size="small" round @click="devSearch">查找</el-button>
        </div>
        <GeminiScrollbar class="tree-sortTree" :style="{height:sortTreeHeight}">
            <el-tree
                class="trackTree"
                :data="sortData"
                :props="defaultProps"
                @node-click="handleCheckChange"
                v-show="!sortDataShow2"
                highlight-current
                default-expand-all>
            </el-tree>
            <el-tree
                class="trackTree"
                :props="defaultProps"
                :load="loadNode"
                lazy
                ref="sortTree"
                highlight-current
                @node-click="handleCheckChange"
                v-if="!sortDataShow">
            </el-tree>
        </GeminiScrollbar>
    </div>

    <div class="location-table" :style="{width:locTableWidth}">
        <div id="container" style="width:100%;" :style="{height:treeHeight}"></div>
        <div class="totalTime">
            <ul>
                <li>
                   <span class="leftname">设备名称</span>
                   <em style="line-height: 20px;margin-top: 10px;">{{searchQuery.deviceName}}</em>
                </li>
                <li>
                    <span class="leftname">设备编码</span>
                    <em>{{searchQuery.deviceCode}}</em>
                </li>
                <li>
                    <span class="leftname">时间段</span>
                    <em>
                        <el-date-picker
                            v-model="searchQuery.beginTime"
                            type="datetime"
                            placeholder="选择开始时间"
                            value-format="timestamp"
                            class="trackTime">
                        </el-date-picker>
                        <el-date-picker
                            v-model="searchQuery.endTime"
                            type="datetime"
                            placeholder="选择结束时间"
                            value-format="timestamp"
                            class="trackTime">
                        </el-date-picker>
                    </em>
                </li>
            </ul>
            <div class="foot">
                <el-button type="primary" size="small" @click="trackData">查询</el-button>
                <el-button type="danger" size="small" @click="startAnimation" v-show="!pause">播放</el-button>
                <el-button type="danger" size="small" @click="pauseAnimation"v-show="pause">暂停</el-button>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {btnauth} from '@/components/Mixin/btnauth'
import { placeholderie } from '@/components/Mixin/placeholderie'
import { fixie9input } from '@/components/Mixin/fixie9input'
import {devicetrial,locationTree,trialGetTime,trialinfo,groupInfo,coordinate} from '@/api/location'
export default {
    components: {
    },
    data() {
        return {
            treeBtn:true,
            listWidth:'345px',
            locTableWidth:'calc(100% - 345px)',
            isShowGaoliang:true,
            sortData:[],
            sortDataShow:true,
            sortDataShow2:true,
            currentNodeKey:[],
            pause:false,
            map:'',
            marker:'',
            sortTreeHeight:'',
            lineArr:[],
            infoWindow:'',
            startMarker:'',
            endMarker:'',
            tableHeight:' ',
            treeHeight:'',
            isEdit:false,
            filterText: '',
            response:[],
            checkedKeys:[],
            contractData: [],
            defaultProps: {
                label: 'name',
                children: 'childTSysGroup',
                isLeaf: 'isLeaf'
            },
            currentIndex:'',
            searchQuery:{
                id:'',
                deviceCode:'',
                deviceName:'',
                endTime:'',
                beginTime:''
            },
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
        this.coordinate(this.groupId)
    },
    mounted() {

        this.infoWindow = new AMap.InfoWindow({
            anchor: 'bottom-center',
            offset: new AMap.Pixel(0, -5)
        });
        // console.log(this.$route.query.id)
        if(this.$route.query.id){
            this.searchQuery.deviceCode = this.$route.query.deviceCode
            this.searchQuery.deviceName = this.$route.query.deviceName
            this.searchQuery.id = this.$route.query.id
            this.currentNodeKey=this.$route.query.id
            this.filterText=this.$route.query.deviceName
            this.trialGetTime()
        }

        this.devSearch()
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
        devSearch(){
            if(this.filterText){
                this.groupInfo()
            }else{
                this.groupChange()
            }
        },

        coordinate(id){
            coordinate(id).then(res=>{
            this.longitude = res.data.longitude
            this.latitude  = res.data.latitude
            // this.mapInit()
            this.map = new AMap.Map("container", {
                resizeEnable: true,
                expandZoomRange:true,
                center: [this.longitude, this.latitude],
                // zoom:17,
                zooms:[4,20],
            });
            })
        },

        // 左侧设备查询
        groupInfo(){
            groupInfo(this.groupId,this.filterText).then(res=>{
                this.sortData=res.data
                this.sortDataShow=true
                this.sortDataShow2=false
            })
        },
        groupChange(id){
            locationTree().then(response => {
                this.response[0]=response.data
                this.sortDataShow2=true
                this.sortDataShow=false
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
                    // console.log(data)
                    resolve(data);
                }else{
                    resolve([]);
                }

            })
        },
        trialGetTime(){
            trialGetTime(this.searchQuery.deviceCode).then(res=>{
                if(res.success&&res.data){
                    this.searchQuery.beginTime=res.data.beginTime
                    this.searchQuery.endTime=res.data.endTime
                    this.trackData()
                }
            })
        },
        trackData(){
            let that=this
            that.lineArr=[]
            // this.searchQuery.deviceCode='12312'
            console.log(that.searchQuery)
            devicetrial(that.searchQuery).then(res=>{
                if(res.success){
                    for(let i=0;i<res.data.length;i++){
                        var arr=[]
                        arr[0]=res.data[i].longitudeGC
                        arr[1]=res.data[i].latitudeGC
                        that.lineArr.push(arr)
                    }
                    console.log(that.lineArr)
                    that.mapInit()
                }
            })
        },
        trialinfo(){
            let that=this
            trialinfo(this.searchQuery.id).then(res=>{
                    let data=res.data
                    if(data){
                        let createTime=that.dateFormat2(data.createTime)
                        let content = "<div class='window'><div class='header'><h2>"+data.groupName+"</h2><h3>"
                            +data.deviceName+"</h3></div><ul><li><span>联系人</span><em>"+
                            data.name+"【"+data.tel+"】</em></li><li><span>北斗民用IC卡号</span><em>"+
                            data.icCard+"</em><li><span>最新地址</span><em>"+
                            data.address+"<br/>（POS:"+data.longitude.toFixed(4)+"，"+data.latitude.toFixed(4)+"）</em></li><li><span>设备时间</span><em>"+
                            createTime+"</em></li></ul></div>";
                        that.infoWindow.setContent(content);
                        that.infoWindow.open(that.map, that.endMarker.getPosition());
                    }
                })
        },
        mapInit(){


            var that=this
            that.map.clearMap()
            // var lineArr = [[116.478935,39.997761],[116.478939,39.997825],[116.478912,39.998549],[116.478912,39.998549],[116.478998,39.998555],[116.478998,39.998555],[116.479282,39.99856],[116.479658,39.998528],[116.480151,39.998453],[116.480784,39.998302],[116.480784,39.998302],[116.481149,39.998184],[116.481573,39.997997],[116.481863,39.997846],[116.482072,39.997718],[116.482362,39.997718],[116.483633,39.998935],[116.48367,39.998968],[116.484648,39.999861]];

            // 绘制轨迹
            var polyline = new AMap.Polyline({
                map: that.map,
                path: this.lineArr,
                strokeColor: "#28F",  //线颜色
                strokeWeight: 6      //线宽
            });

            that.map.setFitView();
            // that.startAnimation (this.lineArr)
            // 起点
            that.startMarker = new AMap.Marker({
                icon: require("../../assets/images/go.png"),
                position: this.lineArr[0],
                offset: new AMap.Pixel(-16, -25),
                map:that.map
            });
            // 终点
            that.endMarker = new AMap.Marker({
                icon: require("../../assets/images/end.png"),
                position: this.lineArr[this.lineArr.length-1],
                offset: new AMap.Pixel(-16, -16),
                map:that.map
            });
            this.pause=false
            that.marker = ''
            that.trialinfo()
            // var content = "<div class='window'><div class='header'><h2>浙江省>杭州市>西湖区>三墩镇</h2><h3>T2C手持终端机</h3></div><ul><li><span>联系人</span><em>程钰【15271361009】</em></li><li><span>北斗民用IC卡号</span><em>123456</em>"+
            // "<li><span>最新地址</span><em>浙江省杭州市三墩镇西湖科技园西园二路<br/>（POS:120°3′28.48″，120°3′28.48″）</em></li><li><span>设备时间</span><em>2019-03-21 10:34:12</em></li></ul></div>";

            // that.infoWindow.setContent(content);
            // that.infoWindow.open(that.map, that.endMarker.getPosition());
            // 关闭信息窗口
            that.map.on('click', closeInfoW)
            function closeInfoW() {
                that.infoWindow.close();
            }

        },
        startAnimation () {
            if(this.marker == ''){
              this.marker = new AMap.Marker({
                  map: this.map,
                  position: this.lineArr[0],
                  icon: require("../../assets/images/guijidian.png"),
                  offset: new AMap.Pixel(-16, -14),
                  autoRotation: true,
                  angle:-90,
              });
            }
            this.marker.moveAlong(this.lineArr, 150);
            this.pause=true
        },
        pauseAnimation(){
            if(this.marker != ''){
              this.marker.pauseMove();
            }
            this.pause=false
        },
        resumeAnimation () {
            this.marker.resumeMove();
        },
        dateFormat2(value) {
            return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "";
        },
        // 查找通讯录
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        // 通讯录加载
        findListByTreeTogether(){
            locationTree().then(response=>{
                this.contractData=response.data
            })
        },
        // tree点击
        handleCheckChange(data) {
            console.log(data)
            if(data.device){
                this.searchQuery.deviceCode=data.code
                this.searchQuery.deviceName=data.name
                this.searchQuery.id=data.id
                this.trialGetTime()
                this.map.clearMap();
            }
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
        .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
            background-color: #2975E6;
            color: #fff;
        }
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
    .trackTree{
        overflow-y: auto;
        .el-tree-node__label{
            font-size: 12px;
        }
    }
}
.location-table{
    float: left;
    position: relative;
    .totalTime{
        position: absolute;
        z-index: 5;
        top: 10px;
        right: 10px;
        text-align: center;
        line-height: 50px;
        background: #fff;
        border-radius: 2px;
        // padding: 0 15px;
        font-size: 12px;
        .trackTime{
            input{
                height: 30px;
                line-height: 30px;
            }
        }
        .foot{
            background-color: rgba(169, 169, 169, 0.35);
        }
        ul{
            list-style: none;
            margin: 0;
            padding: 10px 15px;
            line-height: 40px;
            li{
                overflow: hidden;
                .leftname{
                    float: left;
                    width: 70px;
                }
                em{
                    float: left;
                    width: 200px;
                    font-style: normal;
                    text-align: left;
                    .el-date-editor.el-input, .el-date-editor.el-input__inner{
                        width: 200px;
                    }
                }
            }
        }
    }
    #container{
        color: #282828;
        .amap-info-content{
            padding: 0;
            border-radius: 6px;
        }
        .window{
            .header{
                padding: 10px 10px 0 10px;
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
</style>
