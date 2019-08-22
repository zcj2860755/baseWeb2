<template>
  <div class="app-small" style="background:#fff;">
      <el-row :style="{height:rowHeight}" style="overflow-y: auto;">
        <el-col :span="10" :offset="2">
          <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px" style="margin-top:20px;text-align: center">
            <el-form-item label="账号" prop="account">
              <el-input v-model="formData.account" placeholder="请输入 3-16 位长度的数字或字母" :disabled="isEdit"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="isShow">
              <el-input type="password" v-model="formData.password" @blur="fixinput('password')" @change="forbiddenAutoFill($event,'password')" auto-complete="off" placeholder="请输入密码"></el-input>
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
         </el-col>
      </el-row>
      <el-col :span="18" style="text-align: center;padding:40px 0;">
        <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
        <el-button @click="resetForm('userForm')">取消</el-button>
      </el-col>
  </div>
</template>

<script>
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

      var validPhone=(rule, value,callback)=>{
        // if (!value){
        //     callback(new Error('请输入手机号码'))
        // }else
        if (value&&!isvalidPhone(value)){
          callback(new Error('请输入正确的11位手机号码'))
        }else {
          callback()
        }
      }
      return {
        isShow:true,
        oldVue:'',
        tableHeight:' ',
        rowHeight:'',
        commonList: {
          keyWord:'',
          pageNo: 1,
          pageSize: 0
        },
        total: 1000,
        list: null,
        listLoading: true,
        currentPage: 1,
        pagishow: false,
        multipleSelection: [],
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
        i:0,
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
          tel:'',
          email: ''
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
          tel: [
            {required: true, message: '请输入手机号码', trigger: 'blur'},
            { validator:validPhone, trigger: 'blur' }
            ],
          email: [{ message: '请输入邮箱', trigger: 'blur' }],
         groupId: [
            { required: false, message: '请选择分组', trigger: 'change' }
          ],
          roleId: [
            { required: true, message: '请选择角色', trigger: 'change' }
          ],
        }
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],
    created() {
      this.findRoleByAccount()
      // this.getCommandCardList(this.commonList)
    },
    mounted() {
      let screenHeight=document.documentElement.clientHeight;
      this.tableHeight = screenHeight-305 +'px';
      this.rowHeight=screenHeight-230 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-305}px`;
        that.rowHeight = `${document.documentElement.clientHeight-230}px`;
      };
      if(this.$route.query.id){
        this.formData.id=this.$route.query.id
        this.init(this.$route.query.id)
        this.isShow=false;
      }

    },
    methods: {
      forbiddenAutoFill(val,name){
        var isSupportPlaceholder = 'placeholder' in document.createElement('input')
        if(!isSupportPlaceholder){
          this.ieForm[name] = val
        }
      },
      doneSubmit: function () {

      },

      edit: function (id,groupId) {
        var params={};
        this.init(id,this.formData,groupId)
      },
      //冻结和解冻
      stop: function (id,status) {
        var statusName = '';
        if(status == 0){
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
          params.id = id;
          params.status = status;
          editAccount(params).then(response => {
            if (response.success) {
              this.$message({
                message: statusName+'成功',
                type: 'success'
              })
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
            } else {
              this.$message({
                message: response.message,
                type: 'warning'
              })
            }
          })
        })
      },
      // 账号详情
      init: function (id) {
        var local = this
        var that = this.formData
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
      findProjectByAccount(id){
        groupSelect().then(response => {
          this.proIds = response.data
        })
      },
      submitForm (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            if (!this.formData.id) {
              var params = {};
              params.account = this.formData.account;
              params.password = this.formData.password;
              params.realName = this.formData.realName;
              params.roleId = this.formData.roleId;
              params.tel = this.formData.tel;
              params.email  = this.formData.email;
              params.proId = this.formData.proId;
              params.uuid = getToken();
              submitAccount(params).then(response => {
                if (response.success) {
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                  this.$router.push({path:"/system/account"})
                } else {
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
              })
            } else{
              var params = {};
              params.id = this.formData.id;
              params.account = this.formData.account;
              params.realName = this.formData.realName;
              params.password = this.formData.password;
              params.status = this.formData.status;
              params.roleId = this.formData.roleId;
              params.proId = this.formData.proId;
              params.tel = this.formData.tel;
              params.uuid = getToken();
              editAccount(params).then(response => {
                if (response.success) {
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                  this.$router.push({path:"/system/account"})
                  if(this.formData.id == getAccountId()){
                    setRealName(this.formData.realName)
                    location.reload()
                  }
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
            }
          }
        })
      },
      resetForm (formName) {
        this.$router.push({path:"/system/account"})
        this.$refs[formName].resetFields();
      }
    }
  }
</script>
<style lang="scss">
  .line {
    text-align: center;
  }
</style>
