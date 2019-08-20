<template>
  <div class="login-container" v-show="show">
    <el-carousel height="100%" :interval="5000" autoplay>
      <el-carousel-item>
        <h3></h3>
      </el-carousel-item>
      <el-carousel-item>
        <h4></h4>
      </el-carousel-item>
    </el-carousel>
    <el-form autoComplete="off" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left"
             label-width="0px"
             class="card-box login-form">
      <div class="main">
        <div class="main-head">
            <img src="../../assets/images/logo.png" class="logo"/>
            <h3 class="title">基础模块公共页面</h3>
        </div>

        <el-form-item prop="username" style="position:relative;top:-5px">
          <div class="card-user">用户名</div>
          <el-input name="username" @change="forbiddenname" @blur="fixinput('username')" type="text" v-model="loginForm.username" autoComplete="off" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item prop="password" >
          <div class="card-user">密码</div>
          <el-input name="password" type="password" @change="forbiddenpwd" @blur="fixinput('password')" @keyup.enter.native="handleLogin" v-model="loginForm.password"
                    autoComplete="off"
                    placeholder="请输入密码"/>
        </el-form-item>
        <div class="checkbox">
          <el-checkbox v-model="checked" style="color:#a0a0a0" @change="checkedName">记住账号</el-checkbox>
          <el-checkbox v-model="checked2" style="color:#a0a0a0" @change="checkedPwd">记住密码</el-checkbox>
        </div>
        <el-form-item style="border:0;">
          <el-button class="login-btn" :loading="loading" @click.native.prevent="handleLogin" @keyup.enter="handleLogin">
            登录
          </el-button>
        </el-form-item>
        <div class="copyright">2019-2022 © Copyright. 浙大正呈科技有限公司 - All Rights Reserved.</div>
      </div>
    </el-form>

  </div>
</template>

<script>
  import {isvalidUsername} from '@/utils/validate'
  import IconSvg from '@/components/Icon/index'
  import { fixie9input } from '@/components/Mixin/fixie9input'

  export default {
    components: {IconSvg},
    name: 'login',
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!isvalidUsername(value)) {
          callback(new Error('请输入正确的用户名'))
        } else {
          callback()
        }
      }
      const validatePass = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能小于6位'))
        } else {
          callback()
        }
      }
      return {
        show: true,
        loginForm: {
          username: '',
          password: '',
          sourceUrl:''
        },
        ieForm:{
          username: '',
          password: ''
        },
        loginRules: {
          username: [{required: true, trigger: 'blur', validator: validateUsername}],
          password: [{required: true, trigger: 'blur', validator: validatePass}]
        },
        loading: false,
        checked: false,
        checked2: false
      }
    },
    mixins: [fixie9input],
    created(){

      this.getCookie()
      this.ieForm.username = this.loginForm.username
      this.ieForm.password = this.loginForm.password
      // console.log(this.$route.query.sourceUrl)
      if (this.$route.query.account) {
        this.show = false
        this.loginForm.username = this.$route.query.account
        this.loginForm.password = this.$route.query.password
        this.loginForm.sourceUrl=this.$route.query.sourceUrl
        // this.$refs.loginForm.username = this.$route.query.account
        // this.$refs.loginForm.password = this.$route.query.password
        this.$store.state.user.source=this.$route.query.sourceUrl
        this.handleLogin()
      }
    },
    methods: {
      checkedName(val){
        if(this.checked==false){
          this.checked2=false
        }
      },
      checkedPwd(val){
        if(this.checked2==true){
          this.checked=true
        }
      },
      // 阻止IE9下表单自动填充
      forbiddenname(value){
        this.ieForm.username = value
      },
      forbiddenpwd(value){
        this.ieForm.password = value
      },
      handleLogin() {
        var isIE = /*@cc_on!@*/false || !!document.documentMode
        if(isIE){
           this.loginForm.username = this.ieForm.username
           this.loginForm.password = this.ieForm.password
        }
        // this.$refs.loginForm.validate(valid => {
        //   if (valid) {
            this.loading = true
            console.log(this.ieForm.username)
            console.log(this.ieForm.password)
            this.$store.dispatch('Login', this.loginForm).then(response => {
              console.log(response)
              if(response.success){
                this.loading = false
                if (this.checked) {
                  this.setCookieName(this.loginForm.username, 30)
                }else{
                  this.clearCookieName()
                }
                if (this.checked2) {
                  this.setCookiePwd(this.loginForm.password, 30)
                }else{
                  this.clearCookiePwd()
                }
                this.$router.push({path: '/system/base'})
              }else{
                this.loading = false
                  this.$message.error(response.message)
              }
            }).catch(error => {
              console.log("error="+error)
              this.loading = false
              this.$message.error("账号或密码输入错误!")
            })
        //   } else {
        //     this.$message.error("非法用户名和密码")
        //     console.log('error submit!!')
        //     return false
        //   }
        // })
      },
      setCookieName(name, exdays){
        var exdate=new Date();//获取时间
        exdate.setTime(exdate.getTime() + 24*60*60*1000*exdays);//保存的天数
        //字符串拼接cookie
        window.document.cookie="userName"+ "=" +name+";path=/;expires="+exdate.toGMTString();
      },
      setCookiePwd(pwd, exdays){
        var exdate=new Date();//获取时间
        exdate.setTime(exdate.getTime() + 24*60*60*1000*exdays);//保存的天数
        window.document.cookie="userPwd"+"="+pwd+";path=/;expires="+exdate.toGMTString();
      },
      getCookie:function () {
        if (document.cookie.length>0) {
          var arr=document.cookie.split('; ');//这里显示的格式需要切割一下自己可输出看下
          for(var i=0;i<arr.length;i++){
            var arr2=arr[i].split('=');//再次切割
            //判断查找相对应的值
            if(arr2[0]=='userName'){
              this.loginForm.username=arr2[1];//保存到保存数据的地方
              this.checked=true
            }else if(arr2[0]=='userPwd'){
              this.loginForm.password=arr2[1];
              this.checked=true
              this.checked2=true
            }
          }
        }
      },
      clearCookieName(){
        this.setCookieName("", -1)
      },
      clearCookiePwd(){
        this.setCookiePwd("", -1)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @import "src/styles/mixin.scss";

  $bg: #fff;
  $dark_gray: #889aa4;
  $light_gray: #282828;
  .login-container {
    @include relative;
    font-family: 'Microsoft YaHei';
    height: 100vh;
    background-color: $bg;
    // background: url("../../assets/images/by.png") no-repeat;
    background-size: 100%;
    position: relative;
    .login-form {
      width: 48%;
      height: 100%;
      background: url("../../assets/images/by.png") no-repeat;
      background-size: 100%;
      margin: 0 auto;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 111;
      .main{
        .main-head{
          overflow: hidden;
          margin-bottom: 100px;
          .logo{
            width: 60px;
            height: 60px;
            margin: 30px 25px 0 30px;
            float: left;
          }
          .title {
            float: left;
            margin-top: 39px;
            font-size: 25px;
            color: $light_gray;
            text-align: center;
            font-weight: normal;
            h4{
              font-size: 12px;
              font-weight: normal;
              letter-spacing: -1px;
              margin-top: 5px;
            }
          }
        }
        .checkbox{
          text-align:left;
          padding:0px 0px 0px 150px;
        }
        .card-user{
          color: $light_gray;
          font-size: 16px;
          font-weight:bold;
          margin-bottom: 20px;
          // margin-left: 10px;
        }
        .login-btn {
          width: 370px;
          height: 54px;
          border: none;
          font-size: 18px;
          background-color: #2975E6;
          border-radius:27px;
          color: #fff;
          margin-left: -10px;
        }
        .copyright{
          // margin: 0 auto;
          color: #CFCFCF;
          text-align: center;
          font-size: 14px;
          width: 625px;
          position: fixed;
          z-index: 2;
          bottom: 30px;
        }
      }
    }
    // 走马灯
    .el-carousel{
      height: 100%;
      .el-carousel__indicators{
        left: 74%;
        .el-carousel__indicator{
          padding:12px 8px;
        }
      }
      .el-carousel__button{
        width: 12px;
        height: 12px;
        border-radius: 6px;
      }
      .el-carousel__item h3 {
        text-align: right;
        margin: 0;
        background:url('../../assets/images/turn1.png') no-repeat;
        background-position: 100% 100%;
        background-size:100%;
        width: 100%;
        height: 100%;
      }
      .el-carousel__item h4 {
        text-align: right;
        margin: 0;
        background:url('../../assets/images/turn2.png') no-repeat;
        background-position: 100% 100%;
        background-size:100%;
        width: 100%;
        height: 100%;
      }
    }
    .login-by {
      float: left;
      background-size: 100% 100%;
      width: calc(100% - 570px);
      height: 100%;
    }
    .el-form-item__content {
      overflow: visible;
    }
    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0px 1000px #fff inset !important;
      -webkit-text-fill-color: #000 !important;
    }
    input {
      background: #fff;
      // background: none;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 8px 5px 8px 0px!important;
      // color: #000;
      height: 47px;
      font-size: 18px;
      border-bottom: 1px solid #c7c7c7;
      border-color:#c7c7c7!important;;
    }
    .el-input {
      display: inline-block;
      height: 47px;
      width: 350px;
      // margin-left: 10px;
    }
    .el-form-item {
      color: #d7e7ff;
      font-size: 18px;
      margin: 60px 0 20px 140px;
    }



  }
  @media (max-width:1680px){
    .login-container {
      .login-form {
        width: 50%;
      }

    }
  }
  @media (max-width:1370px){
    .login-container {
      .login-form {
        width: 46%;
        .main{
          .main-head{
            margin-bottom: 0px;
            .logo{
              width: 50px;
              height: 50px;
              margin: 30px 20px 0px 20px;
            }
            .title{
              font-size: 22px;
              h4{
                letter-spacing: -1.5px;
              }
            }
          }
          .checkbox{
            padding:0px 0px 0px 100px;
          }
          .card-user{
            margin-bottom: 0;
          }
          .copyright{
            width: 515px;
          }
          .login-btn{
            width: 310px;
          }
        }

      }

      .el-form-item{
        margin: 45px 0 20px 90px;
      }
      .el-input{
        width: 290px;
      }

    }
  }
</style>

