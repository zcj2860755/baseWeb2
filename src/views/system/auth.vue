<template>
  <div class="app-small">
    <table-operate >
      <el-button type="primary" size="small" v-if="hasAuth('authAdd')" @click="gotoForm">添加</el-button>
      <!--<el-button type="danger" size="small" @click="gotoForm">删除</el-button>-->
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyword" clearable placeholder="权限名称" @keyup.enter.native="doneSubmit"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit stripe style="with:100%">
        <el-table-column prop="authName" label='权限名称' style="width:10%"></el-table-column>
        <el-table-column prop="authSign" label="权限标识" style="width:25%"></el-table-column>
        <el-table-column prop="authUrl" label="访问路径" style="width:25%"></el-table-column>
        <el-table-column prop="parentName" label="上级权限" style="width:25%"></el-table-column>
        <el-table-column prop="authType" label="权限类型" style="width:25%">
          <template slot-scope="scope">
            <div v-for="item in powerTypeStatus" v-if="scope.row.authType==item.dicValue">{{item.dicKey}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" style="width:45%"></el-table-column>
        <el-table-column label="操作" style="width:10%" align="center">
          <template slot-scope="scope">
            <el-button size="medium"  type="text" v-if="hasAuth('authEdit')" @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="medium" style="color:#F78989" type="text"  v-if="hasAuth('authDelete')" @click="remove(scope.row.id)">删除</el-button>
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

    <el-dialog
      :title="userDialog.title"
      :visible.sync="userDialog.show"
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item class="parentAuth-container" label="上级权限" prop="parentId">
            <el-select v-model="formData.parentId">
            <el-option label=" " value="0"></el-option>
            <el-option
                  v-for="item in parentPowerStatus"
                  :key="item.id"
                  :label="item.authName"
                  :value="item.id">
                </el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="权限名称" prop="authName">
            <el-input v-model="formData.authName"></el-input>
          </el-form-item>
          <el-form-item label="权限标识" prop="authSign">
            <el-input v-model="formData.authSign"></el-input>
          </el-form-item>
          <el-form-item label="访问路径">
            <el-input v-model="formData.authUrl"></el-input>
          </el-form-item>
          <el-form-item label="文件路径">
            <el-input v-model="formData.authFilePath"></el-input>
          </el-form-item>
          <el-form-item label="图标">
            <el-input v-model="formData.icon"></el-input>
          </el-form-item>
          <el-form-item class="parentAuth-container" label="权限类型" prop="authType">
            <el-select v-model="formData.authType">
            <el-option
                  v-for="item in powerTypeStatus"
                  :key="item.dicValue"
                  :label="item.dicKey"
                  :value="item.dicValue">
                </el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input v-model="formData.sortNo"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10}"
              placeholder="请输入内容"
              v-model="formData.remark"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
        <el-button @click="resetForm('userForm')">取消</el-button>
      </span>
    </el-dialog>
    </div>
  </div>
</template>

<script>
  import { authList,deleteAuth } from '@/api/auth'
  import {dictionaryListDicByParent} from '@/api/dataDar'
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import { mapGetters } from 'vuex'
  import { btnauth } from '@/components/Mixin/btnauth'
  import { authAddSubmit,authUpdateSubmit, editAuth, verifyAuthSign, getAllAuthority} from '@/api/authDetail'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data () {
      var validateAuthSign = (rule, value, callback) => {
        verifyAuthSign(value,this.id).then(response =>{
            if(response.data.length>0){
              callback(new Error('权限标识已存在!'))
            }else{
              callback()
            }
        })
      }
      return {
        id:"",
        list: null,
        listLoading: true,
        currentPage: 1,
        pagishow: false,
        total:'',
        listQuery: {
          keyword: '',
          pageNo: 1,
          pageSize: 10
        },
        tableHeight:' ',
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        powerTypeStatus:[],
        parentPowerStatus:[],
        selectList:[],
        selectName:'',
        //上级权限按钮所需数据
        authList:[],
        props : {
          value : "id",
          label : "authName",
        },
        parentAndLevel:'',
        //提示消息
        msg: null,
        //表单数据
        formData: {
          id: null,
          createTime: null,
          authName: null,
          icon:'',
          remark: null,
          sortNo:'',
          parentIds: [],
          parentId:'',
          authLevel: null,
          authUrl: null,
          authSign:'',
          authType:'',
          authFilePath:'',
          authTypes:[
            {
              "id": 1,
              "name": "菜单"
            }, {
              "id": 2,
              "name": "操作"
            }
          ]
        },
        //校验
        rules: {
          authName: [
            {required: true, message: '请输入权限名称', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ],
          authSign: [
            {required: true, message: '请输入权限标识', trigger: 'blur'},
            {validator: validateAuthSign, trigger: 'blur' }
          ],
          authUrl: [
            { message: '请输入路径', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ],
          authType: [
            {required: true, message: '请选取权限类型', trigger: 'blur'}
          ],
          sortNo: [
            {required: true, message: '请输入排序', trigger: 'blur'}
          ],
        },
      }
    },
    mixins: [btnauth],
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mounted() {
        let screenHeight=document.documentElement.clientHeight;
        let screenWidth=document.documentElement.clientWidth;
        this.tableHeight = screenHeight-305 +'px';
        const that = this;
        window.onresize = function temp() {
          that.tableHeight = `${document.documentElement.clientHeight-305}px`;
        };
    },
    created () {
      this.fetchData()
      this.dictionaryListDicByParent('powerType')
      //this.selectList=this.$store.state.allDic.allDictionary.powerType.dictionary
      //this.selectName=this.$store.state.allDic.allDictionary.authDetailType.name
    },
    methods: {
      gotoForm () {
        this.fetchAuthList()
        this.userDialog.title="权限添加"
        this.userDialog.show=true
        this.powerStatus()
        this.formData.id=''
        this.formData.authName=''
        this.formData.authSign=''
        this.formData.parentId=''
        this.formData.authUrl=''
        this.formData.icon=''
        this.formData.remark=''
        this.formData.sortNo=''
        this.formData.authFilePath=''
        // this.$router.push({path:'/system/authDetail', query: {isEdit: false, pageName: '权限参数添加'}})
      },
      onSubmit: function () {
        console.log('submit!')
      },
      fetchData () {
        this.listLoading = true
        authList(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if (this.total > 0) {
            this.pagishow = true
          }

          this.list = response.data.list
          this.listLoading = false
        })
      },
      remove: function (accountId) {
        //var index = this._.findIndex(this.list, ['accountId', accountId])
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAuth(accountId).then(response => {
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
      edit: function (authId) {
        //  this.$router.push({path:'/system/authDetail',query: {authId: authId, isEdit: true, pageName: '权限编辑'}})
        this.userDialog.title="权限编辑"
        this.userDialog.show=true
        this.powerStatus(authId)
        this.init(authId,this.formData)
      },
      doneSubmit: function () {
        this.fetchData()
      },
      powerStatus: function (id) {
        var params={};
        params.pageSize=0
        params.id=id
        params.authTypeBlack=3
        authList(params).then(response =>{
          this.parentPowerStatus=response.data.list
        })
      },
      // 详情
      init: function (id,that) {
        var local = this
        local.id=id

        editAuth(id).then(response =>{
          let parentId=[]
          // console.log(response)
          that.id = response.data.id
          that.authName = response.data.authName
          that.authUrl = response.data.authUrl
          that.remark = response.data.remark
          that.authSign = response.data.authSign
          that.authType = response.data.authType
          that.icon = response.data.icon
          that.sortNo = response.data.sortNo
          that.parentId = response.data.parentId
          that.authFilePath = response.data.authFilePath
        })
        this.fetchAuthList(id)
      },
      //获取上级权限按钮所需数据
      fetchAuthList (id) {
        getAllAuthority(id).then(response => {
          // response.data.selectedIds.pop()
          // console.log(response)
          this.formData.parentIds= response.data.selectedIds
          // console.log(this.formData.parentIds)
          this.authList = response.data.tree
        })
      },
      //表单提交
      submitForm (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
              //格式化数据
            //this.formData.parentId = this.formData.parentIds[this.formData.parentIds.length - 1]
            // console.log(this.formData.parentId)
            //提交后台
            var params={} ;
            params.id=this.formData.id
            params.authName = this.formData.authName;
            params.authSign = this.formData.authSign;
            params.authUrl = this.formData.authUrl;
            params.authType = this.formData.authType;
            params.parentId = this.formData.parentId;
            params.icon = this.formData.icon;
            params.remark = this.formData.remark;
            params.sortNo = this.formData.sortNo;
            params.authFilePath =this.formData.authFilePath
            console.log(params)
            if(params.id != ''){
              authUpdateSubmit(params).then(response => {
                if(response.success){
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                  //this.$router.push({path:'/system/auth'})
                  this.fetchData()
                  this.userDialog.show=false
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
              })
            }else{
              authAddSubmit(params).then(response => {
                if(response.success){
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                  //this.$router.push({path:'/system/auth'})
                  this.fetchData()
                  this.userDialog.show=false
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
              })
            }

            // alert('submit!')
          } else {
            return false
          }
        })
      },
      dictionaryListDicByParent (id) {
        dictionaryListDicByParent({"parentKey":id}).then(response =>{
          this.powerTypeStatus=response.data;
        })
      },
       handleSizeChange(val) {
        this.listQuery.pageSize = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.listQuery.pageNo = val
        this.fetchData()
      },
      resetForm (formName) {
        this.userDialog.show=false
        this.$refs[formName].resetFields();
      }
    }
  }
</script>
