<template>
  <div class="headtopbar">
    <el-menu class="navbar" mode="horizontal">
      <logo></logo>
      <!-- <sidebar></sidebar> -->

      <el-dropdown class="avatar-container">
        <div class="avatar-wrapper">
          <!-- <img class="user-avatar" src="../../assets/images/avatardefault.jpg"> -->
          <div class="login-name">{{realName}}</div>
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <!-- <router-link class='inlineBlock' to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link> -->
          <el-dropdown-item ><span @click="revisePassword" style="display:block;">修改密码</span></el-dropdown-item>
          <el-dropdown-item ><span @click="logout" style="display:block;">退出登录</span></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>


      <!-- <div style="text-align: right;">
        <div class="news">
          <a href="#" @click="jump('/message/inbox')"><img src="../../assets/images/email.png"/>未读消息{{count}}条</a>
        </div>
      </div> -->
      <div class="noticeCount">
        <router-link class='inlineBlock fr' to="/message/inbox" title="收件箱">
          <img src="../../assets/images/inbox.png" width="35" height="35"/>
          <div class="numCount" v-if="noticeCount!=0"><el-badge :value="noticeCount" :max="99" v-model="noticeCount"></el-badge></div>
        </router-link>
      </div>
      <div class="noticeCount">
        <router-link class='inlineBlock fr' to="/sos/sosInbox" title="紧急SOS">
          <img src="../../assets/images/sos.png" width="35" height="35"/>
          <div class="numCount" v-if="sosCount!=0"><el-badge :value="sosCount" :max="99" v-model="sosCount"></el-badge></div>
        </router-link>
      </div>
      <div class="dayData"><i class="el-icon-date"></i> {{dayData1}}(农历{{dayData}})</div>
      <div  class="loginUser">
        <div class="login-name">{{account}} 欢迎您！</div>
      </div>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import URLConfig from '@/config'
import Sidebar from './Sidebar'
import { getAccountId,getAccount,getRealName} from '@/utils/auth'
import {showCal} from '@/utils/index'
import {inboxunRead} from  '@/api/inbox'

export default {

  data() {
      return {
        value1: true,
        value2: false,
        accountId: '',
        account:getAccount(),
        realName:getRealName(),
        count:'',
        alarmNumber: '',
        existStompClient: false,
        showVoice: false,
        firstAlarm: false,
        show:true,
        dayData1:'',
        dayData:'',
        countData:[],
        noticeCount:0,
        path:URLConfig.webSocketUrl,
        socket:"",
        sosCount:0
      }
    },
  components: { Logo,Sidebar },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ]),
    diaphaneity: function () {
        // 若为0
        if(!this.alarmNumber) {
            return 'margin-right:20px';
        }
        // 否则不添加样式
        return '';
    }
  },
  created (){
    //this.noticeCount=this.$store.state.user.noticeCount
    this.groupId = this.$store.state.user.groupId
    this.accountId = getAccountId()
    this.account = getAccount()
    var now = new Date(); //当前日期
    this.dayData1=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()
    this.dayData=showCal()
    this.fetchData()
    this.socketInit()
  },
  methods: {
    socketInit: function () {
      if(typeof(WebSocket) === "undefined"){
        alert("您的浏览器不支持socket")
      }else{
        // 实例化socket
        var sid = this.groupId;
        let alarmWsURL =this.path + sid;
        this.socket = new WebSocket(alarmWsURL)
        // 监听socket连接
        this.socket.onopen = this.open
        // 监听socket错误信息
        this.socket.onerror = this.error
        // 监听socket消息
        this.socket.onmessage = this.getMessage
      }
    },
    openSocket: function () {
      console.log("socket连接成功")
    },
    errorSocket: function () {
      console.log("连接错误")
    },
    getMessage: function (msg) {
      let data = JSON.parse(msg.data);
      var url = location.href
      if(data.type==0){
        this.sosCount =  data.sosCount;
        this.noticeCount = data.noticeCount;
        if(url.indexOf('/message/inbox')>-1 || url.indexOf('/sos/sosInbox')>-1 || url.indexOf('/message/hasSend')>-1){
          this.$parent.dateRefresh()
        }
      }else if(data.type==1){
        if(url.indexOf('/sos/sosInbox')>-1){
          this.$parent.dateRefresh()
        }
        this.sosCount =  data.sosCount;
      }else if(data.type==2){
        if(url.indexOf('/message/inbox')>-1){
          this.$parent.dateRefresh()
        }
        this.noticeCount = data.noticeCount;
      }else if(data.type==3){
        if(url.indexOf('/message/hasSend')>-1){
          this.$parent.dateRefresh()
        }
      }
    },
    sendSocket: function () {
      this.socket.send(params)
    },
    closeSocket: function () {
      console.log("socket已经关闭")
    },
    toggleSideBar () {
      this.$store.dispatch('ToggleSideBar')
    },
    jump(url){
      this.$router.push({path:url})
    },
    logout () {
      this.$store.dispatch('LogOut').then(() => {
        if(!this.$store.state.user.source){
          location.reload()
        }
      })
      if(this.$store.state.user.source){
        window.location.href=this.$store.state.user.source
      }
    },
    revisePassword(){
      // this.show=!this.show
      this.$emit('show',this.show)
    },
    fetchData() {
      inboxunRead().then(response =>
      {
        if (response.data != null && response.data.length > 0) {
          this.count = response.data.length;
        } else {
          this.count = 0;
        }
      })

    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.numCount .el-badge__content{
      border:0!important;
    }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
    $light_gray: #282828;
    
    .noticeCount{
      float: right;
      color: #0C1E38;
      margin-right: 20px;
      padding-top: 10px;
      .inlineBlock{
        position: relative;
        display: block;
        .numCount{
          position: absolute;
          z-index: 2;
          top: -20px;
          right: -9px;
        }
      }
      .el-badge__content.is-fixed{
        position: relative;
        transform:translateY(0) translateX(0);
      }
    }
    .login-name{
      color: $light_gray;
      text-align: right;
      padding-right: 45px;
    }
    .side-bar{
      float: left;
    }
    .headtopbar{
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
    }
    .navbar {
        // overflow: hidden;
        height: 50px;
        background: #fff;
        line-height: 50px;
        border-radius: 0px !important;
        border-bottom: none;
        box-shadow:0px 2px 5px 0px rgba(0, 0, 0, 0.06);
        .errLog-container {
            display: inline-block;
            position: absolute;
            right: 150px;
        }
        .screenfull {
            position: absolute;
            right: 90px;
            top: 16px;
            color: red;
        }
        .avatar-container {
            // background: url("../../assets/images/account-by.png") no-repeat;
            height: 43px;
            float: right;
            padding-left: 32px;
            .avatar-wrapper {
                cursor: pointer;
                position: relative;
                .user-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 30px;
                }
                .el-icon-caret-bottom {
                    position: absolute;
                    right: 25px;
                    top: 18px;
                    font-size: 12px;
                    color: $light_gray;
                }
            }
        }
        .dayData{
          padding-right:43px;
          float: right;
          color: #545454;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .loginUser{
          float: right;
          color: #545454;
          font-size: 12px;
          letter-spacing: 1px;
        }
    }



</style>
