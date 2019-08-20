<template>
  <div class="app-small">
    <table-operate >
      <el-button type="primary" size="small"  @click="gotoform">添加</el-button>
      <el-button type="danger" size="small"  @click="batchRemove">删除</el-button>
    </table-operate>
     <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyword" clearable @focus="inputfocus('role')" @blur="inputblur('role')" placeholder="角色名称" @keyup.enter.native="onSubmit"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" element-loading-text="拼命加载中" @selection-change="handleSelectionChange" border fit stripe style="with:100%">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="roleName" label='角色名称' style="width:10%"></el-table-column>
        <el-table-column prop="createTime" label='创建时间' style="width:10%" :formatter="dateFormat"></el-table-column>
        <el-table-column label="操作" style="width:10%" align="center">
          <template slot-scope="scope">
            <el-button size="medium" type="text"    @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="medium"  style="color:#F78989" type="text" @click="remove(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <table-pagination v-if="pagishow" style="text-align:right">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 50, 100, 200]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </table-pagination>
    </div>
    <el-dialog
      :title="userDialog.title"
      :visible.sync="userDialog.show"
      width="1000px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="formData.roleName" placeholder="请输入角色名称，长度不超过 50 个字符"></el-input>
          </el-form-item>
          <el-form-item label="是否可登录" prop="isLogin">
              <el-switch
                v-model="formData.isLogin"
                active-color="#409eff"
                inactive-color="#dcdfe6"
                active-value="0"
                inactive-value="1">
              </el-switch>
          </el-form-item>
          <el-form-item class="authchekckboxs" label="角色权限" prop="type">
            <el-tree
              :data="data2"
              show-checkbox
              node-key="id"
              :default-checked-keys="checkedKeys"
              :default-expanded-keys='checkedKeys'
              :props="defaultProps"
              ref="roleTree"
              @check-change="handleCheckChange"
              :check-strictly="true">
            </el-tree>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
        <el-button @click="resetForm('userForm')">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="stopDialog.title"
      :visible.sync="stopDialog.show"
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item>
            <el-button type="primary" @click="submitStopForm('userForm')">保存</el-button>
            <el-button @click="resetForm('userForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
  import { formatDate } from '@/api/date'
  import { roleList,getRoleAuth,deleteRole } from '@/api/role'
  import { getRoleAuthAll,defaultAuth } from '@/api/auth'
  // import { getRoleAuthAll } from '@/api/account'
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import { mapGetters } from 'vuex'
  import { btnauth } from '@/components/Mixin/btnauth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { editRole, submitRoleEdit,submitRoleAdd, getRoles, verifyRoleCode, authTree } from '@/api/roleDetail'
  import {findAllChildOrgByAccount} from '@/api/org'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data () {
      var validateRoleCode = (rule, value, callback) => {
        if(this.userDialog.title=="角色添加") {
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
        childtype:'',
        value3:"100",
        tableHeight:' ',
        listQuery: {
          keyword:'',
          pageNo: 1,
          pageSize: 10
        },
        total: 1000,
        list: null,
        listLoading: true,
        currentPage: 1,
        pagishow: false,
        multipleSelection: [],
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        stopDialog: {
          show:false,
          title:''
        },
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
          status:"0",
          createTime:''
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

    mixins: [btnauth,placeholderie],
    computed: {
      ...mapGetters(['permission_routers']),
    },
    created () {
      this.fetchData()
    },
    mounted() {
        let screenHeight=document.documentElement.clientHeight;
        this.tableHeight = screenHeight-305 +'px';
        const that = this;
        window.onresize = function temp() {
          that.tableHeight = `${document.documentElement.clientHeight-305}px`;
        };
    },
    methods: {
      gotoform () {
        // this.getRoleTree()
        // this.findDefaultAuth()
        // this.userDialog.title="角色添加"
        // this.userDialog.show=true
        // this.formData.roleName=''
        // this.checkedKeys=[]
        this.$router.push({path:'/system/roleDetail', query: {isEdit: false, pageName: '角色添加'}})
      },
      //时间格式化
      dateFormat(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
      },
      onSubmit: function () {
        this.fetchData();
      },
      fetchData () {
        this.listLoading = true
        var isSupportPlaceholder = 'placeholder' in document.createElement('input')
        if(!isSupportPlaceholder){
          if(this.listQuery.keyword == '角色名称'){
            this.listQuery.keyword = ''
          }
        }
          roleList(this.listQuery).then(response => {
          this.listLoading = false
            this.list = response.data.list
            this.total = response.data.totalCount
            if (this.total > 0) {
              this.pagishow = true
            }
          var isSupportPlaceholder = 'placeholder' in document.createElement('input')
          if(!isSupportPlaceholder){
            if(this.listQuery.keyword == ''){
              this.listQuery.keyword = '角色名称'
            }
          }
        })
      },
      edit: function (roleId) {
        // this.userDialog.title="角色编辑"
        // this.userDialog.show=true
        // this.init(roleId,this.formData)
        this.$router.push({path:'/system/roleDetail',query: {roleId: roleId, isEdit: true, pageName: '角色编辑'}})
      },
      stop: function (roleId) {
        this.stopDialog.title="编辑状态"
        this.stopDialog.show=true
      },
      remove: function (roleId) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRole(roleId).then(response => {
            if(response.success){
                this.fetchData()
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
          })
        })
      },
      batchRemove() {
        if (this.multipleSelection.length > 0) {
          this.$confirm('确定要删除已选中的角色？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteRole(this.multipleSelection).then(response => {
              if (response.success) {
                this.fetchData()
                this.$message({
                  message: response.message,
                  type: 'success'
                })
                this.multipleSelection = []
                this.handleSelectionChange(this.multipleSelection)
                this.fetchData()
              } else {
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
            })
          })
        } else {
          this.$message({
            message: '请选择需要删除的角色账号',
            type: 'warning'
          })
        }
      },
      handleSizeChange (val) {
        this.listQuery.pageSize = val
        this.fetchData()
      },
      handleCurrentChange (val) {
        this.listQuery.pageNo = val
        this.fetchData()
      },
      handleSelectionChange (val) {
        this.multipleSelection = []
        val.forEach(element => {
          this.multipleSelection.push(element.id)
        });
      },
      init: function (id,that) {
        var local = this
        editRole(id).then(response =>{
          that.id = response.data.id
          that.roleName = response.data.roleName
          that.createTime = response.data.createTime
          that.isLogin=response.data.isLogin.toString()
          local.getRoleTree(that.id)
          if(response.data.authIds!=[]){
            // let authIds=response.authIds.length
            // console.log(response.data.authIds)
            this.checkedKeys=response.data.authIds
            this.authIds=this.checkedKeys
            // console.log(this.checkedKeys)
          }
          // local.findAllChildOrgByAccount(that.orgId)
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
      findAllChildOrgByAccount(id){
        findAllChildOrgByAccount(id).then(response => {
          // console.log(response)
          this.parentIds= response.data.selectedIds
          // console.log(this.formData.parentId)
          this.orgs = response.data.tree
        })
      },
      submitForm (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            if(!this.isContained(this.authIds,this.defaultAuth)){
              this.authIds=this.authIds.concat(this.defaultAuth)
            }
            // console.log(this.formData)
            // console.log(this.authIds)
            if(this.userDialog.title=="角色编辑"){
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
                this.fetchData();
                this.userDialog.show=false
              })
            }else if(this.userDialog.title=="角色添加"){
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
                this.fetchData();
                this.userDialog.show=false
              })
            }
          } else {
            return false
          }
        })
      },
      resetForm (formName) {
        this.userDialog.show=false
        this.stopDialog.show=false
        this.$refs[formName].resetFields();
      },
    }
  }
</script>
