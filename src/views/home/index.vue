<template>
  <div>
    <div class="queryData">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item >
          <el-date-picker
            v-model="listQuery.beginTime"
            type="date"
            format='yyyy-MM-dd'
            value-format='yyyy-MM-dd'>
          </el-date-picker>
          至
          <el-date-picker
            v-model="listQuery.endTime"
            type="date"
            format='yyyy-MM-dd'
            value-format='yyyy-MM-dd'>
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit" class="queryBtn">查询</el-button>
        </el-form-item>
        <el-form-item>
          <div v-model="listQuery.activeName" class="tabs">
            <div class="tabsItem" :class="isActive[0]" @click="tabsActive(0)">本月</div>
            <div class="tabsItem" :class="isActive[1]" @click="tabsActive(1)">本周</div>
            <div class="tabsItem" :class="isActive[2]" @click="tabsActive(2)">本日</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="statistical-quantity">
      <div class="card">
        <div class="logo logo1">收件箱</div>
        <div class="news">
          <span>{{receivedNum}}<i>条</i></span>
          <a href="#" @click="jump('/message/inbox')">查看消息</a>
        </div>
      </div>
      <div class="card">
        <div class="logo logo2">已发送</div>
        <div class="news">
          <span>{{sendNum}}<i>条</i></span>
          <a href="#" @click="jump('/message/hasSend')">查看消息</a>
        </div>
      </div>
      <div class="card">
        <div class="logo logo3">紧急sos</div>
        <div class="news">
          <span>{{sosNum}}<i>条</i></span>
          <a href="#" @click="jump('/sos/sosInbox')">查看消息</a>
        </div>
      </div>
    </div>
    <div class="app-chart">
      <h3 class="chart-title">信息发送量</h3>
      <div  id="chart" :style="cylinderStyle"></div>
    </div>

  </div>
</template>

<script>
  import TableSearch from '@/components/Table/Search'
  import {mapGetters} from 'vuex'
  import {btnauth} from '@/components/Mixin/btnauth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { fixie9input } from '@/components/Mixin/fixie9input'
  import {getIndex} from '@/api/index'
  let echarts = require('echarts/lib/echarts')
  require('echarts/lib/chart/line')
  require('echarts/lib/chart/bar')
  require('echarts/lib/component/tooltip')
  require('echarts/lib/component/title')
  require('echarts/lib/component/dataset')
  require('echarts/lib/component/legend')
  require('echarts/lib/component/toolbox')
  export default {
    components: {
      TableSearch
    },
    data() {
      return {
        listQuery:{
          beginTime: '',
          endTime: '',
          activeName: 'second'
        },
        receivedNum:'0',
        sendNum:'0',
        sosNum:'0',
        isActive:['','',''],
        cylinderStyle: {
          width: '100%',
          height: '430px'
        },
        option:{
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: []
            },
            yAxis: {
                type: 'value'
            },
            tooltip: {
              trigger: 'axis',
              position: function (pt) {
                  return [pt[0], '10%'];
              }
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '10%',
                top: '5%',
                containLabel: true
            },
            series: [{
                data: [],
                type: 'line',
                smooth: true,
                color:'#2975e6',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0,0,0, 1, [{
                        offset: 0,
                        color: '#3da6ff'
                    }, {
                        offset:1,
                        color: '#ffffff'
                    }])
                },
            }]
        }
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],
    created() {
      let screenHeight=document.documentElement.clientHeight;
      this.cylinderStyle.height = screenHeight-405 +'px';
      if(document.documentElement.clientWidth<=1366){
        this.cylinderStyle.height = screenHeight-365 +'px';
      }
      const that = this;
      window.onresize = function temp() {
        that.cylinderStyle.height = `${document.documentElement.clientHeight-405}px`;
        if(document.documentElement.clientWidth<=1366){
          that.cylinderStyle.height = `${document.documentElement.clientHeight-365}px`;
        }
      };
      var now = new Date(); //当前日期
      var start=now.getFullYear()+'-01-01';
      var today=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();

      that.listQuery.beginTime=start
      that.listQuery.endTime=today
      that.fetchData()
    },
    mounted() {
      let screenHeight=document.documentElement.clientHeight;
      this.cylinderStyle.height = screenHeight-405 +'px';
      if(document.documentElement.clientWidth<=1366){
        this.cylinderStyle.height = screenHeight-365 +'px';
      }
      const that = this;
      window.onresize = function temp() {
        that.cylinderStyle.height = `${document.documentElement.clientHeight-405}px`;
        if(document.documentElement.clientWidth<=1366){
          that.cylinderStyle.height = `${document.documentElement.clientHeight-365}px`;
        }
      };
      //初始化图表
      that.chartInit()
    },

    methods: {
      chartInit() {
        this.chart = echarts.init(document.getElementById('chart'))
        this.chart.setOption(this.option)
      },
      doneSubmit(){
        this.isActive=[]
        this.fetchData()
      },
      jump(url){
        this.$router.push({path:url, query: {beginTime: this.listQuery.beginTime,endTime:this.listQuery.endTime}})
      },
      fetchData() {
          if(this.listQuery.beginTime){
            var sTime = new Date(this.listQuery.beginTime.replace(/-/g, '/'))
          }
          if(this.listQuery.endTime){
            var eTime = new Date(this.listQuery.endTime.replace(/-/g, '/'))
          }
          if(sTime>eTime){
            this.$message({
              message: '开始时间不能大于结束时间',
              type: 'warning'
            })
          }else{
            getIndex(this.listQuery).then(response => {
                if(response.success){
                  this.option.xAxis.data=response.data.time;
                  this.option.series[0].data=response.data.num;
                  this.receivedNum=response.data.receivedNum;
                  this.sendNum=response.data.sendNum;
                  this.sosNum=response.data.sosNum;
                  this.chartInit()
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
            })
          }
      },
      tabsActive(index) {
        var now = new Date(); //当前日期
        if(index == 0){//本月
           var today=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
           now.setDate(now.getDate() - 30);
           var start=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        }else if(index == 1){//本周
           var today=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
          now.setDate(now.getDate() - 7);
          var start=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        }else if(index == 2){//本日
          var start=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
          var today=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
        }
        this.listQuery.beginTime=start
        this.listQuery.endTime=today
        this.isActive=[]
        this.isActive[index]='isActive'
        this.fetchData()
      },

    }
  }
</script>
<style lang="scss">
  $light_gray: #282828;
  .homeTime.el-date-editor.el-input{
    width: 180px;
    input{
      width: 180px;
      height: 30px;
    }
  }
  .app-chart{
    margin: 5px;
    background-color: #fff;
    border-radius: 6px;
    overflow: hidden;
    font-size: $light_gray;
    font-size: 14px;
    .chart-title{
      margin-top: 20px;
      margin-left: 16px;
    }
  }
  .queryData{
    background-color: #fff;
    height: 60px;
    padding: 10px 20px;
    .tabs{
      overflow: hidden;
      border: 1px solid #2975E6;
      color: #2975E6;
      height: 30px;
      line-height: 30px;
      border-radius: 15px;
      margin-top: 5px;
      margin-left: 200px;
      .tabsItem{
        float: left;
        padding: 0 17px;
        cursor: pointer;
        border-right: 1px solid #2975E6;
      }
      .tabsItem:last-child {
          border-right: none;
      }
      .isActive{
        background-color: #2975E6;
        color: #fff;
      }
    }
    .el-range-editor.el-input__inner{
      height: 30px;
    }
    .el-date-editor .el-range-separator{
      width: auto;
      line-height: 23px;
    }
    .el-date-editor .el-range__icon{
      line-height: 0;
    }
    .el-date-editor .el-range__close-icon{
       line-height: 0;
    }
    .queryBtn{
      width:60px;
      height:30px;
      background:rgba(41,117,230,1);
      border-radius:15px;
    }
  }
  .statistical-quantity{
    margin: 5px;
    overflow: hidden;
    width:  calc(100% - 5px);
    .card{
      float: left;
      width: calc((100% - 15px)/3);
      margin-right: 5px;
      height: 155px;
      border-radius: 6px;
      background-color: #fff;
      padding: 40px 30px;
      overflow: hidden;
      .logo{
        float: left;
        height: 56px;
        line-height: 56px;
        font-size: 18px;
        color: $light_gray;
        padding-left: 75px;
      }
      .logo1{
        background: url("../../assets/images/inbox.png") no-repeat;
      }
      .logo2{
        background: url("../../assets/images/send.png") no-repeat;
      }
      .logo3{
        background: url("../../assets/images/sos.png") no-repeat;
      }
      .news{
        float: right;
        color: #545454;
        font-size: 14px;
        text-align: right;
        span{
          display: block;
          font-size: 30px;
          margin-bottom: 15px;
          i{
            font-style: normal;
          }
        }
        a{
          color: #2975E6;

        }
      }
    }
    .card:last-child {
        margin-right: 0;
    }
  }
@media(max-width:1366px) {
  .statistical-quantity{
    .card{
      height: 115px;
      padding: 25px 30px;
    }
  }
}
</style>
