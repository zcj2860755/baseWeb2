<template>
  <el-breadcrumb class="app-levelbar" separator="●">
    <el-breadcrumb-item v-for="(item,index)  in levelList" :key="item.path">
      <router-link v-if='item.redirect==="noredirect"||index==levelList.length-1' to="" class="no-redirect">{{item.name}}</router-link>
      <router-link v-else :to="item.redirect||item.path">{{item.name}}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  created () {
    this.getBreadcrumb()
  },
  data () {
    return {
      levelList: null
    }
  },
  methods: {
    getBreadcrumb () {
      let matched = this.$route.matched.filter(item => item.name )
      //console.log(this.$route)

      var lastOne = matched[matched.length - 1]
      var path = lastOne.path
      var name = lastOne.name
      // console.log(matched)
      if (this._.endsWith(path, 'Detail')) {
        if(this._.endsWith(path, 'dicDetail')){
          var newpath = '/system/categoryList'
        }else{
          var newpath = path.substring(0,path.length-6)
        }
        var newname = name.substring(0,name.length - 2)
        // console.log(newname)
        matched.splice(-1, 0, { name: newname, path: newpath})
        matched.splice(-1, 1, { name: this.$route.query.pageName, path: 'test'})
      }
      if (this._.endsWith(path, 'dicList')) {
        // console.log(this.$route)
        var newpath = '/system/categoryList'
        var newname = name.substring(0,name.length - 2)
        matched.splice(-1, 0, { name: newname, path: newpath})
        matched.splice(-1, 1, { name: this.$route.name, path: 'test'})
      }

      var arr = path.split('/')
      if (arr.length === 4) {
        var newpath = path.substring(0,path.lastIndexOf('/'))
        var newname = name.substring(0,name.length - 2)
        matched.splice(-1, 0, { name: newname, path: newpath})

      }

      // const first = matched[0]
      // if (first && (first.name !== '首页' || first.path !== '')) {
      //   matched = [{ name: '首页', path: '/' }].concat(matched)
      // }
      // console.log(matched)
      // matched[1].path=''


      this.levelList = matched

    }
  },
  watch: {
    $route () {
      this.getBreadcrumb()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-levelbar.el-breadcrumb {
  font-size: 13px;
  line-height:40px;
  border-bottom:1px solid #e7ecf1;
  padding-left: 20px;
  background-color: #fff;
  height: 40px;
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
