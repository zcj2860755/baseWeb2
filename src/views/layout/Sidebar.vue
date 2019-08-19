<template>
  <GeminiScrollbar class="side-bar" :style="{height:treeHeight}">
    <!-- <toggle-side></toggle-side> -->
    <div @click="collapse" class="shousuo1" :class="{shousuo2:isCollapse===true}"></div>
    <el-menu mode="vertical" :collapse="isCollapse" class="sidemenu" unique-opened background-color="transparent" text-color="#fff" active-text-color="#fff" :default-active="activeRoute">
      <template v-for="item in permission_routers">
        <router-link class="alone" v-if="item.children&&item.children.length==1&&!item.hidden&&item.authType==0" :to="item.path+'/'+item.children[0].path" :key="item.name">
          <el-menu-item :index="item.path+'/'+item.children[0].path">
            <em :class="item.icon"></em>
            <span slot="title">{{item.name}}</span>
          </el-menu-item>
        </router-link>

        <!-- <a :href="'#'+item.path" class="alone" v-if="!item.hidden&&item.children.length==0"  target="_blank">
          <el-menu-item :index="item.path">
            <em :class="item.icon"></em>
            <span slot="title">{{item.name}}</span>
          </el-menu-item>
        </a> -->
        
        <el-submenu v-if="item.children&&item.children.length>0&&!item.hidden&&item.authType==1" :index="item.path+'/'+item.children[0].path" :key="item.name">
          <template slot="title">
            <em :class="item.icon"></em>
            <span slot="title">{{item.name}}</span>
          </template>
          <template v-for="child in item.children">
            <router-link v-if="child.authType==1" :to="item.path+'/'+child.path" :key="child.name">
              <el-menu-item :index="item.path+'/'+child.path" style="width:154px;overflow:hidden;">
                <span slot="title">{{child.name}}</span>
              </el-menu-item>
            </router-link>
          </template>
        </el-submenu>
      </template>
    </el-menu>
  </GeminiScrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import ToggleSide from './ToggleSide'
import IconSvg from '@/components/Icon/index'
export default {
  components: { IconSvg, ToggleSide },
  data () {
    return {
      isCollapse: false,
      treeHeight:''
    }
  },
  computed: {
    ...mapGetters(['permission_routers']),
    // isCollapse () {
    //   return !this.$store.state.app.sidebar.opened
    // },
    activeRoute () {
      // console.log(this.$route)
      var path = this.$route.path

      if(this._.endsWith(path, 'Detail')){
        return path.substring(0,path.length-6)
      } else {
        return this.$route.path
      }
    }
    // 只使用本地router配置文件中的router
    // routes () {
    //   return this.$router.options.routes
    // }
  },
  mounted() {
      let screenHeight=document.documentElement.clientHeight;
      this.treeHeight=screenHeight-45 +'px';
      const that = this;
      window.onresize = function temp() {
          that.treeHeight = `${document.documentElement.clientHeight-45}px`;
      };

  },
  methods:{
    collapse(){
      this.isCollapse=!this.isCollapse
      this.$store.state.app.sidebar.opened=!this.isCollapse
      // console.log(this.$store.state.app.sidebar.opened)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">



.el-menu--vertical{
  .el-menu{
    background: #fff!important;
    .el-menu-item{
      color: #282828!important;
    }
  }
}
.side-bar{
  overflow-y: auto;
  overflow-x: hidden;
  .gm-scrollbar.-vertical {
    display: none;
  }

  /* horizontal scrollbar track */
  .gm-scrollbar.-horizontal {
      display: none;
  }

  .shousuo1{
    width: 100%;
    height:29px;
    background: url("../../assets/images/shousuo1.png") no-repeat #dfeafb 90px 9px;
  }
  .shousuo2{
    width: 100%;
    height:29px;
    background: url("../../assets/images/shousuo2.png") no-repeat #dfeafb 26px 9px;
  }
  .alone{
    float: left;
    width: 100%;
    // height: 58px;
    span{
        margin-left: 35px;
      }
  }
  .router-link-exact-active.router-link-active{
    
    .is-active{
      background:url("../../assets/images/active_button.png") repeat !important;
      
    }
    
  }
}
.app-levelbar.el-breadcrumb .no-redirect{
  pointer-events:none; 
}
.sidemenu{
  li{
    position: relative;
    min-width: 64px;
    em{
      width: 16px;
      height: 16px;
      display: block;
      position: absolute;
      z-index: 111;
      top:15px;
      left: 25px;
      background-size: 100%;
    }
    .home{
      background: url("../../assets/images/home.png") no-repeat;
    }
    .duanxinguanli{
      top: 18px;
      background: url("../../assets/images/duanxinguanli.png") no-repeat;
    }
    .dingweiguanli{
      background: url("../../assets/images/dingweiguanli.png") no-repeat;
    }
    .yingjijiuyuan{
      background: url("../../assets/images/yingjijiuyuan.png") no-repeat;
    }
    .jichuxinxi{
      top: 16px;
      background: url("../../assets/images/jichuxinxi.png") no-repeat;
    }
    .shebeiguanli{
      background: url("../../assets/images/shebeiguanli.png") no-repeat;
    }
    .xitongguanli{
      background: url("../../assets/images/xitongguanli.png") no-repeat;
    }
    span{
      margin-left: 30px;
    }
  }
}


.el-menu--collapse .el-menu .el-submenu, .el-menu--popup{min-width: 100px;}
.el-menu--horizontal{border-bottom: none;}
.sidemenu {
  transition: none !important;
  
  .el-submenu{
    float: left;
    width: 100%;
  }

}
.el-menu {
  // min-height: 100%;
  border-right: none;
  // overflow-x: hidden;
}

// 菜单收缩
.el-menu--collapse {
  // width: 46px;
  .el-menu-item .el-tooltip {
    padding: 0 11px !important;
  }
}

// 浮动菜单
.el-menu--popup .el-menu-item.is-active {
  background:url("../../assets/images/active_button.png") repeat !important;
}

// 菜单展开
.el-menu--inline {
  .el-menu-item {
    padding-left: 20px !important;
  }
}


.el-menu--horizontal>.el-submenu.is-active .el-submenu__title{
  border: 0;
}
.el-menu--horizontal .el-menu .el-menu-item, 
.el-menu--horizontal .el-menu .el-submenu__title{
  padding: 0;
  height: 58px;
  line-height: 58px;
  border: 0;
  margin: 0;
  text-align: center;
}
.el-menu-item:hover{
  background:url("../../assets/images/active_button.png") repeat !important;
}
.el-submenu:hover{
  .el-submenu__title {
    background:url("../../assets/images/active_button.png") repeat !important;
    // margin-left: -10px;
  }
}
.el-submenu.is-active {
  .el-submenu__title {
    background:url("../../assets/images/active_button.png") repeat !important;
    color: #fff!important;
  }
  .el-menu-item.is-active {
    background:url("../../assets/images/active_button.png") repeat !important;
  }
}

.el-menu-item,
.el-submenu__title {
  margin-bottom: 5px;
  margin-top: 5px;
  height: 46px;
  line-height: 46px;
  span{
    font-size: 14px;
  }
}
.el-submenu .el-menu-item {
  height: 40px;
  line-height: 40px;
}
</style>
