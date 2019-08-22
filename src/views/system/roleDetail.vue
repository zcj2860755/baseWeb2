<template>
  <div class="app-small">
    <div class="app-container":style="{height:rowHeight}" style="overflow-y: auto;">
      <el-row style="padding-top:20px;" >
        <el-col :span="22" :offset="1">
          <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
            <el-col :span="12">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="formData.roleName" placeholder="请输入角色名称，长度不超过 50 个字符"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item label="是否可登录" prop="isLogin">
                  <el-switch
                    v-model="formData.isLogin"
                    active-color="#409eff"
                    inactive-color="#dcdfe6"
                    active-value="0"
                    inactive-value="1">
                  </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="23">
              <el-form-item  label="角色权限" prop="type">
                <el-tree
                  class="roleAuthTree"
                  :data="data2"
                  show-checkbox
                  node-key="id"
                  :default-checked-keys="checkedKeys"
                  :default-expanded-keys='checkedKeys'
                  :props="defaultProps"
                  ref="roleTree"
                  @check-change="handleCheckChange"
                  :check-strictly="true"
                  default-expand-all>
                </el-tree>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <!-- 提交表单 -->
              <el-form-item>
                <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
                <el-button @click="resetForm('userForm')">取消</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { getRoleAuthAll,defaultAuth } from '@/api/auth'
import { editRole, submitRoleEdit,submitRoleAdd, getRoles, verifyRoleCode, authTree } from '@/api/roleDetail'
import { roleList,getRoleAuth,deleteRole } from '@/api/role'
export default {
  data () {
    var validateRoleCode = (rule, value, callback) => {
      if(this.pageName=="角色添加") {
        verifyRoleCode(this.formData.roleName).then(response => {
          if (response.statusCode == '0') {
            callback()
          } else {
            callback(new Error('角色名称已存在!'))
          }
        })
      }else{
        callback()
      }
    }
    return {
      rowHeight:'',
      pageName:'',
      data2: [],
      checkedKeys:[],
      defaultAuth:[],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      props : {
        value : "id",
        label : "orgName",
      },
      parentIds: [],
      formData: {
        id:'',
        roleName:'',
        isLogin:'0',
        status:"0"
      },
      authIds:[],
      orgs:[],
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 50, message: '角色名称长度不能超过 50 个字符', trigger: 'blur' },
          {validator: validateRoleCode, trigger: 'blur' }
        ],
        remark: [{ min: 0, max: 300, message: '备注长度不能超过 300 个字符', trigger: 'blur' }]
      }
    }
  },
  created (){
    var id = this.$route.query.roleId
    this.pageName=this.$route.query.pageName
    var that  = this.formData
    if(id) {
      this.init(id,that)
    }else{
      this.getRoleTree()
    }
  },
  mounted() {
    let screenHeight=document.documentElement.clientHeight;
    this.rowHeight=screenHeight-140 +'px';
    const that = this;
    window.onresize = function temp() {
        that.rowHeight = `${document.documentElement.clientHeight-140}px`;
    };

  },
  methods: {
    init: function (id,that) {
      var local = this
      editRole(id).then(response =>{
        that.id = response.data.id
        that.roleName = response.data.roleName
        // that.createTime = response.data.createTime
        that.isLogin=response.data.isLogin.toString()
        local.getRoleTree(that.id)
        if(response.data.authIds!=[]){
          this.checkedKeys=response.data.authIds
          this.authIds=this.checkedKeys
        }
      })

    },
    findDefaultAuth: function () {
      defaultAuth().then(response=>{
        this.defaultAuth=response.data
        this.checkedKeys=response.data
        this.authIds=this.checkedKeys
      })
    },
    getRoleTree: function (id) {
      getRoleAuthAll().then(response=>{
        this.data2=response.data
      })
    },
    isContained: function (a,b) {
      if(!(a instanceof Array) || !(b instanceof Array)) return false;
      if(a.length < b.length) return false;
      var aStr = a.toString();
      for(var i = 0, len = b.length; i < len; i++){
        if(aStr.indexOf(b[i]) == -1) return false;
      }
      return true;
    },
    handleCheckChange(data, checked, indeterminate){
      this.childtype++
      // console.log(this.childtype)
      let userRoutesItem = []
      const loop = {
        loopTreeItem(item,allroleData) {
          userRoutesItem.push(item.id)
          if (item.children) {
            let childrens = item.children
            childrens.forEach((childone) => {
              loop.loopTreeItem(childone,allroleData)
            })
          }
          return userRoutesItem
        }
      }
      let allroleData=[]
      this.authIds=[]
      allroleData=this.$refs.roleTree.getCheckedNodes()
      // console.log(data)
      // console.log(allroleData)
      // console.log(userRoutesItem)
      for(let i=0;i<allroleData.length;i++){
        this.authIds.push(allroleData[i].id)
      }
      // console.log(allroleData)
      // 取消勾选时，遍历当前id下子集id，递归合并到userRoutesItem数组中
      if(checked==false){
        var outId=loop.loopTreeItem(data,allroleData)
        // 比较两个数组，删除authIds中含有outId数组中的元素
        for(var i = 0;i < outId.length; i++) {
          for(var j = 0; j < this.authIds.length; j++) {
            if(this.authIds[j] === outId[i]) {
              this.authIds.splice(j,1);
              j--;
            }
          }
        }
        // console.log(this.authIds);
      }else if(data.children&&checked==true&&this.childtype!=2){
        var outId=loop.loopTreeItem(data,allroleData)
        this.authIds=this.authIds.concat(outId)
        // console.log(this.authIds);
        this.childtype=2
      }
      // 点击勾选时，若authIds数组中没有当前父级的id时，加入authIds中
      if(data.parentId!=0&&this.authIds.indexOf(data.parentId)==-1&&checked==true){
        this.authIds.push(data.parentId)
        this.childtype=1
        // console.log("wwewew")
      }
      this.$refs.roleTree.setCheckedKeys(this.authIds)
      // console.log(this.authIds);
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if(!this.isContained(this.authIds,this.defaultAuth)){
            this.authIds=this.authIds.concat(this.defaultAuth)
          }
          console.log(this.pageName)
          console.log(this.authIds)
          if(this.pageName=="角色编辑"){
            submitRoleEdit(this.formData,this.authIds).then(response =>{
              if(response.success){
                this.$message({
                  message: response.message,
                  type: 'success'
                })
              }else{
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
              this.$router.push({path:'/system/role'})
            })
          }else if(this.pageName=="角色添加"){
            var params={} ;
            params.roleName = this.formData.roleName;
            params.isLogin = this.formData.isLogin;
            // params.authIds = this.authIds;
            submitRoleAdd(params,this.authIds).then(response =>{
              if(response.success){
                this.$message({
                  message: response.message,
                  type: 'success'
                })
              }else{
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
              this.$router.push({path:'/system/role'})
            })
          }
        } else {
          return false
        }
      })
    },
    resetForm (formName) {
      this.$router.push({path:'/system/role'})
    },

  }
}
</script>
<style lang="scss">
.roleAuthTree{
  overflow: hidden;
  .el-tree-node,.el-tree-node__content{
    float: left;
  }
}
.roleAuthTree>.el-tree-node,.roleAuthTree>.el-tree-node>.el-tree-node__children>.el-tree-node{
  clear: both;
}
// .roleAuthTree>.el-tree-node>.el-tree-node__children>.el-tree-node>.el-tree-node__children>.el-tree-node>.el-tree-node__children>.el-tree-node{
//   clear: both;
// }
.roleAuthTree .el-tree-node__expand-icon{
  display: none;
}
</style>
