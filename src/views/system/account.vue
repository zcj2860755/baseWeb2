<template>
  <div class="app-small"  style="background:#fff;">
    <table-operate >
      <el-button type="primary" size="small"  @click="gotoform">添加</el-button>
      <el-button type="danger" size="small"  @click="batchRemove">删除</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyword" clearable @focus="inputfocus('account')" @blur="inputblur('account')" placeholder="账号/用户名" @keyup.enter.native="doneSubmit"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight"  element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
        <el-table-column type="selection" width="60" align="center"/>
        <el-table-column prop="account" label="账号" width="160"/>
        <el-table-column prop="realName" label="姓名" min-width="180"/>
        <el-table-column prop="roleName" label="角色" min-width="180"/>
        <el-table-column prop="tel" label="手机号码" min-width="180"/>
        <el-table-column prop="email" label="邮箱" min-width="180"/>
        <el-table-column label="状态" min-width="100">
          <template slot-scope="scope">
            <div v-if="scope.row.status == 0" style="color:#00A854">● 启用</div>
            <div v-else style="color:#FF0000">● 停用</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="180">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" type="text" @click="edit(scope.row.id,scope.row.groupId)">编辑</el-button>
            <template >
            <el-button size="medium" style="color:#4687BE" type="text"  @click="stop(scope.row)" v-if="scope.row.status==0">停用</el-button>
            <el-button size="medium" style="color:#4687BE" type="text"  @click="stop(scope.row.id,scope.row.status)" v-if="scope.row.status==1">启用</el-button>
           </template>
            <el-button size="medium" style="color:#F78989" type="text"  @click="remove(scope.row.id)">删除</el-button>
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
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="账号" prop="account">
            <el-input v-model="formData.account" placeholder="请输入 3-16 位长度的数字或字母" :disabled="isEdit"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="realName">
            <el-input v-model="formData.realName" @blur="fixinput('realName')" @change="forbiddenAutoFill($event,'realName')" placeholder="请输入姓名或单位名称"></el-input>
          </el-form-item>
          <el-form-item label="角色" prop="roleId">
            <el-select v-model="formData.roleId" placeholder="请选择角色"  style="width:100%">
              <el-option v-for="item in roles" :key="item.id" :label="item.roleName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手机号码" prop="tel">
            <el-input v-model="formData.tel" @blur="fixinput('tel')" @change="forbiddenAutoFill($event,'tel')"placeholder="请输入联系方式"></el-input>
          </el-form-item>
          <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="formData.email" @blur="fixinput('email')" @change="forbiddenAutoFill($event,'email')"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
        <el-button @click="resetForm('userForm')">取消</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import {getAccountList, deleteAccount} from '@/api/account'
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import {mapGetters} from 'vuex'
  import {btnauth} from '@/components/Mixin/btnauth'
  import {getAccountId, getRoleId,setRealName,getToken} from '@/utils/auth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { editAccount, submitAccount,verifyAccount,AccountInfo} from '@/api/accountDetail'
  import {findRoleByAccount} from '@/api/role'
  import {groupSelect,groupSelectEdit} from '@/api/group'
  import { isvalidPhone, validateNumberAndEnglish } from '@/utils/validate'
  import { fixie9input } from '@/components/Mixin/fixie9input'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      var validateAccount = (rule, value, callback) => {
        if(!this.isEdit){
          verifyAccount(value).then(response =>{
            if(response.message=="该用户账号已存在"&&value!=this.oldVue){
              callback(new Error('该用户账号已存在!'))
            }else if(!validateNumberAndEnglish(value)){
              callback(new Error('请输入数字或英文!'))
            }else{
              callback()
            }
          })
        }else if(!validateNumberAndEnglish(value)){
          callback(new Error('请输入数字或英文!'))
        }else{
          callback()
        }
      }
      return {
        oldVue:'',
        tableHeight:' ',
        listQuery: {
          keyword: '',
          roleId: '',
          proId: '',
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
        isEdit:false,
        groups:[],
        groupProps:{
          value : "id",
          label : "name",
          children: 'childTSysGroup'
        },
        level: '',
        relativeLevel:'',
        cityindex: '',
        countyindex: '',
        response: [],
        roles:[],
        proIds:[],
        formData: {
          account: '',
          password: '',
          realName: '',
          proId:'',
          roleId:'',
        },
        ieForm:{
          pass: '',
          password: '',
          realName: '',
          email: ''
        },
        rules: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' },
            {validator: validateAccount, trigger: 'blur' }
          ],
          realName: [{ required: true,min: 0, max: 20, message: '请保持长度在 20 位及以下', trigger: 'blur'}],

          password: [
            {required: true, min: 6, max: 20, message: '请保持长度在 6 到 20 位', trigger: 'blur' }
          ],
          proId: [
            { required:false , message: '请选择分组', trigger: 'change' }
          ],
          roleId: [
            { required: true, message: '请选择角色', trigger: 'change' }
          ]
        }
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],

    mounted() {
      this.fetchData();
      let screenHeight=document.documentElement.clientHeight;
      this.tableHeight = screenHeight-305 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-305}px`;
      };
    },
    methods: {
      forbiddenAutoFill(val,name){
        var isSupportPlaceholder = 'placeholder' in document.createElement('input')
        if(!isSupportPlaceholder){
          this.ieForm[name] = val
        }
      },
      //时间格式化
      dateFormat(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
      },
      gotoform() {
        this.$router.push({path:"/system/account/accountAdd"})
      },
      doneSubmit: function () {
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        getAccountList(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if (this.total > 0) {
            this.pagishow = true
          }
        })
      },
      edit: function (id,groupId) {
        this.$router.push({path:"/system/account/accountEdit", query: {id: id}})
      },
      //冻结和解冻
      stop: function (data) {
        var statusName = '';
        if(data.status == 0){
          status =1
          statusName = '冻结';
        }else{
          status =0
          statusName = '启用';
        }
        this.$confirm('是否确定'+statusName+'？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var params = {};
          params.id = data.id;
          params.status = status;
          params.account =data.account
          params.realName = data.realName
          params.roleId = data.roleId
          params.tel = data.tel
          params.uuid = getToken()
          params.email = data.email
          params.proId = data.proId
          editAccount(params).then(response => {
            if (response.success) {
              this.$message({
                message: statusName+'成功',
                type: 'success'
              })
              this.fetchData()
            } else {
              this.$message({
                message: response.message,
                type: 'warning'
              })

              if(response.statusCode == 40007){
                this.$store.dispatch('LogOut').then(() => {
                  location.reload()
                })
              }
            }
          })
        })
      },
      remove: function (id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAccount(id).then(response => {
            if (response.success) {
              this.$message({
                message: response.message,
                type: 'success'
              })
              this.fetchData()
            } else {
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
          this.$confirm('确定要删除已选中的账户？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteAccount(this.multipleSelection).then(response => {
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
            message: '请选择需要删除的账号',
            type: 'warning'
          })
        }
      },
      handleSizeChange(val) {
        this.listQuery.pageSize = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.listQuery.pageNo = val
        this.fetchData()
      },
      handleSelectionChange(val) {
        this.multipleSelection = []
        val.forEach(element => {
          this.multipleSelection.push(element.id)
        });
      },
      // 账号详情
      init: function (id,that) {
        var local = this
        AccountInfo(id).then(response =>{
          that.id = response.data.id
          that.account = response.data.account
          that.realName = response.data.realName
          that.status = response.data.status.toString()
          that.roleId = response.data.roleId
          that.proId = response.data.proId
          that.tel = response.data.tel
          that.email = response.data.email
          this.oldVue= response.data.account
        })

      },
      findRoleByAccount(id){
        findRoleByAccount().then(response => {
          this.roles = response.data
        })
      },
      submitForm (formName) {
        this.formData.groupId=this.groupId[this.groupId.length-1]
        console.log(this.groupId)
        this.$refs[formName].validate(valid => {
          if (valid) {
            if (this.userDialog.title == "新增账号") {
              var params = {};
              params.account = this.formData.account;
              params.password = this.formData.password;
              params.realName = this.formData.realName;
              params.roleId = this.formData.roleId;
              params.groupId = this.formData.groupId;
              submitAccount(params).then(response => {
                if (response.success) {
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                  this.userDialog.show = false
                  this.fetchData()
                } else {
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
              })
            } else if(this.userDialog.title == "账号编辑"){
              var params = {};
              params.id = this.formData.id;
              params.account = this.formData.account;
              params.realName = this.formData.realName;
              params.password = this.formData.password;
              params.status = this.formData.status;
              params.roleId = this.formData.roleId;
              params.groupId = this.formData.groupId;
              editAccount(params).then(response => {
                if (response.success) {
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                  this.userDialog.show = false
                  if(this.formData.id == getAccountId()){
                    setRealName(this.formData.realName)
                    location.reload()
                  }
                  this.fetchData()
                } else {
                    this.$message({
                      message: response.message,
                      type: 'warning'
                    })

                    if(response.statusCode == 40007){
                      this.userDialog.show = false
                      this.$store.dispatch('LogOut').then(() => {
                        location.reload()
                      })
                    }

                }
              })
            }
          }
        })
      },
      resetForm (formName) {
        this.userDialog.show=false
        this.$refs[formName].resetFields();
      }
    }
  }
</script>
<style lang="scss">

</style>
