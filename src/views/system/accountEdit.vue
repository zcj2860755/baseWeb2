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
            <el-form-item label="分组" prop="groupId">
              <el-cascader
                separator=">"
                clearable
                change-on-select
                @change="handleItemChange"
                :options="groups"
                v-model="groupId"
                :props="groupProps"
                placeholder="请选择所属的分组"
                style="width:100%"
                ref="cascader2">
              </el-cascader>
            </el-form-item>
            <el-form-item label="指挥卡" prop="command_id">
              <el-select v-model="formData.command_id" placeholder="请选择所属的指挥卡" style="width:100%">
                <el-option v-for="item in commands" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
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
  import {getAccountId, getRoleId,setRealName} from '@/utils/auth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { editAccount, submitAccount,verifyAccount,AccountInfo} from '@/api/accountDetail'
  import {findRoleByAccount} from '@/api/role'
  import {getCommandCardList} from '@/api/command'
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
        commands:[],
        groupId:[],
        formData: {
          account: '',
          password: '',
          realName: '',
          groupId:'',
          roleId:'',
          command_id:'',
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
          groupId: [
            { required: true, message: '请选择分组', trigger: 'change' }
          ],
          roleId: [
            { required: true, message: '请选择角色', trigger: 'change' }
          ],
          command_id: [
            { required: true, message: '请选择指挥卡', trigger: 'change' }
          ]
        }
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],
    created() {
      this.findRoleByAccount()
      this.getCommandCardList(this.commonList)
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
      this.groupChange('')
      if(this.$route.query.id){
        this.formData.id=this.$route.query.id
        this.init(this.$route.query.id)
        this.isShow=false;
      }

    },
    methods: {
      groupChange2(id){
        groupSelectEdit(id).then(response => {
          this.level = response.data[0].grade
          this.groups=response.data
          this.groupId=response.data[0].ids
        })

        groupSelect().then(response => {
          this.response[0]=response.data
        })
      },
      groupChange(id,ids){
        groupSelect(id).then(response => {
          if(response.data.length>0){
            setTimeout(() => {
                if(this.groups.length>0 && this.groups[0].grade<5 && response.data[0].grade<5 && this.i!==1){
                  this.$refs.cascader2.menuVisible=true
                }
            }, 5);
            this.i++
            if(this.relativeLevel === ''){
               this.relativeLevel = response.data[0].grade-1;
            }
            var allLevel = 5 - this.relativeLevel;
            this.level = response.data[0].grade-this.relativeLevel
            this.response[this.level - 1] = response.data
            if (this.level < allLevel) {
              for(let i=0;i<response.data.length;i++){
                response.data[i].childTSysGroup=[]
              }
            }
            if (this.level <= allLevel) {
              if (this.level === 2) {
                this.cityindex = this._.findIndex(this.response[0], [
                  'id',
                  id,
                ])
                if(this.groups.length >0 ){
                  this.groups[this.cityindex].childTSysGroup = response.data
                }else{
                  this.groups = response.data
                  this.cityindex = 0
                }
              } else if (this.level === 3) {
                this.countyindex = this._.findIndex(this.response[1], [
                  'id',
                  id,
                ])
                if(this.response[this.level-2]){
                  if(this.groups[this.cityindex].childTSysGroup.length > 0){
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                  }else{
                    this.groups[this.cityindex].childTSysGroup = response.data
                  }
                }else{
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.groups[this.cityindex].childTSysGroup[0].childTSysGroup = response.data
                }

              } else if (this.level === 4) {
                if(this.response[2]){
                  this.blockindex = this._.findIndex(this.response[2], [
                    'id',
                    id,
                  ])
                }else{
                  this.blockindex=0
                }
                if(this.response[1]&&this.response[2]){
                  if(this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup.length > 0){
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                  }else{
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                  }
                }else{
                  if(this.response[0]){
                    this.cityindex = this._.findIndex(this.response[0], [
                      'id',
                      ids[0],
                    ])
                  }else{
                    this.cityindex=0
                  }

                  if(this.response[1]){
                    this.countyindex = this._.findIndex(this.response[1], [
                      'id',
                      ids[1],
                    ])
                  }else{
                    this.countyindex=0
                  }

                  this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                }

              } else if (this.level === 5) {
                if(this.response[1] && this.response[2] && this.response[3]){
                  this.unitindex = this._.findIndex(this.response[3], [
                    'id',
                    id,
                  ])
                  if(this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup.length > 0){
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup = response.data
                  }else{
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup =null
                  }
                }else{
                    if(this.response[0]){
                      this.cityindex = this._.findIndex(this.response[0], [
                        'id',
                        ids[0],
                      ])
                    }else{
                      this.cityindex=0
                    }
                    if(this.response[1]){
                      this.countyindex = this._.findIndex(this.response[1], [
                        'id',
                        ids[1],
                      ])
                    }else{
                      this.countyindex = 0
                    }
                    if(this.response[2]){
                      this.blockindex = this._.findIndex(this.response[2], [
                        'id',
                        ids[2],
                      ])
                    }else{
                       this.blockindex=0
                    }
                    if(this.response[3]){
                      this.unitindex = this._.findIndex(this.response[3], [
                        'id',
                        ids[3],
                      ])
                    }else{
                      this.unitindex = 0
                    }
                    this.groups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup = response.data
                }

              }  else {
                this.groups = response.data
              }
            } else {
              return 0
            }
          }
        })
      },
      handleItemChange(val) {
        var id = val[val.length-1]
        this.groupChange(id,val)
        this.formData.groupId=id
      },
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
        this.groupChange('');
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
          that.command_id = response.data.command_id
          that.groupId = response.data.groupId
          this.oldVue= response.data.account
          this.groupChange2(response.data.groupId)
        })

      },
      findRoleByAccount(id){
        findRoleByAccount().then(response => {
          this.roles = response.data
        })
      },
      getCommandCardList(){
        getCommandCardList(this.commonList).then(response => {
          this.commands = response.data.list
          console.log("test:"+response.data.list)
        })
      },
      submitForm (formName) {
        this.formData.groupId=this.groupId[this.groupId.length-1]
        //console.log(this.groupId)
        this.$refs[formName].validate(valid => {
          if (valid) {
            if (!this.formData.id) {
              var params = {};
              params.account = this.formData.account;
              params.password = this.formData.password;
              params.realName = this.formData.realName;
              params.command_id = this.formData.command_id;
              params.roleId = this.formData.roleId;
              params.groupId = this.formData.groupId;
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
              params.groupId = this.formData.groupId;
              params.command_id = this.formData.command_id;
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
