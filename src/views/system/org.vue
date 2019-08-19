<template>
  <div class="app-small">
    <table-operate>
      <el-button type="primary" size="small" @click="gotoform">添加</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyword" @focus="inputfocus('org')" @blur="inputblur('org')" placeholder="组织名称" @keyup.enter.native="onSubmit"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange" border fit stripe style="with:100%">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="parentOrgFullName" label="上级组织机构" style="width:35%"></el-table-column>
        <el-table-column prop="orgName" label='组织名称' style="width:10%"></el-table-column>
        <el-table-column prop="orgCode" label='组织编码' style="width:10%"></el-table-column>
        <el-table-column prop="contacts" label="联系人" style="width:10%"></el-table-column>
        <el-table-column prop="tel" label="联系电话" style="width:10%"></el-table-column>
        <el-table-column prop="remark" label="备注" style="width:35%"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" style="width:10%">
          <template slot-scope="scope">
            <div>{{scope.row.createTime | formatDate}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" align="center">
          <template slot-scope="scope">
            <el-button size="small" :plain="true" type="primary" @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="small" :plain="true" type="danger" @click="remove(scope.row.id)">删除</el-button>
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
          <el-form-item label="上级组织">
            <el-cascader
              separator=">"
              clearable
              change-on-select
              :options="orgs"
              :props="props"
              v-model="parentIds"
              :disabled="disabled">
            </el-cascader>
          </el-form-item>
          <el-form-item label="组织名称" prop="orgName">
            <el-input v-model="formData.orgName" placeholder="请输入组织名称，长度不超过 80 个字符"></el-input>
          </el-form-item>
          <el-form-item label="组织编码" prop="orgCode">
            <el-input v-model="formData.orgCode" placeholder="请输入组织标识，长度不超过 40 个字符"></el-input>
          </el-form-item>
          <el-form-item label="启用" prop="isEnable">
            <el-select v-model="formData.isEnable" placeholder="">
              <el-option v-for="item in stats" :key="item.statusId" :label="item.statusName" :value="item.statusId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="orders">
            <el-input v-model="formData.orders"></el-input>
          </el-form-item>
          <el-form-item label="手机">
            <el-input v-model="formData.tel"></el-input>
          </el-form-item>
          <el-form-item label="电子邮箱">
            <el-input v-model="formData.email"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注，长度不超过 300 个字符"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
            <el-button @click="resetForm('userForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from '@/api/date'
import { orgList,deleteOrg,findAllChildOrgByAccount } from '@/api/org'
import { editOrg,submitOrg,verifyOrgCode,verifyOrgName } from '@/api/orgDetail'
import TableOperate from '@/components/Table/Operate'
import TableSearch from '@/components/Table/Search'
import TablePagination from '@/components/Table/PagiContainer'
import { mapGetters } from 'vuex'
import { btnauth } from '@/components/Mixin/btnauth'
import { placeholderie } from '@/components/Mixin/placeholderie'
import Group from '@/components/Group/index'
export default {
  components: {
    TableOperate,
    TableSearch,
    TablePagination,
    Group
  },
  data () {
    var validateOrgName = (rule, value, callback) => {
      verifyOrgName(value).then(response =>{
        if(response){
            callback()
        }else{
          callback(new Error('组织名称已存在!'))
        }
      })
    }
    var validateOrgCode = (rule, value, callback) => {
      verifyOrgCode(value).then(response =>{
        if(response){
            callback()
        }else{
          callback(new Error('组织标识已存在!'))
        }
      })
    }
    return {
      tableHeight:' ',
      listQuery: {
        areaId: '',
        orgType: '',
        keyword: '',
        pageNo: 1,
        pageSize: 10
      },
      total: 1000,
      list: null,
      listLoading: false,
      currentPage: 1,
      pagishow: false,
      multipleSelection: [],
      // 详情弹框
      userDialog: {
        show:false,
        title:''
      },
      disabled:false,
      orgs:[],
      props : {
        value : "id",
        label : "orgName",
      },
      stats:[
        {
        "statusId": 1,
        "statusName": "启用"
        }, {
        "statusId": 0,
        "statusName": "停用"
        }
      ],
      parentIds: [],
      formData: {
        id:'',
        isEnable:1,
        parentId:'',
        orgName: '',
        orgCode: '',
        tel: '',
        email: '',
        remark: '',
        orders:'',
        areaId:''
      },
      rules: {
        belongAreaId: [{ required: true, message: '请选择所属区域', trigger: 'change' }],
        parentId: [
          { required: true, message: '请选择上级组织', trigger: 'change' }
        ],
        orgName: [
          { required: true, message: '请输入组织名称', trigger: 'blur' },
          { min: 1, max: 80, message: '组织名称长度不能超过 80 个字符', trigger: 'blur' },
          {validator: validateOrgName, trigger: 'blur' }
          ],
        orgCode: [
          { required: true, message: '请输入组织标识', trigger: 'blur' },
          { min: 1, max: 40, message: '组织标识长度不能超过 40 个字符', trigger: 'blur' },
          {validator: validateOrgCode, trigger: 'blur' }
          ],
        isEnable: [{ required: true,message: '请选择是否启用', trigger: 'blur' }],
        orders: [{ required: true,min: 0, max: 20, message: '请输入排序', trigger: 'blur' }],
        isVirtual: [
          { required: true, message: '请选择组织类型', trigger: 'change' }
        ],
        remark: [{ min: 0, max: 300, message: '备注长度不能超过 300 个字符', trigger: 'blur' },]
      }
    }
  },
  filters: {
    formatDate(time) {
      var date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd hh:mm');
    }
  },
  mixins: [btnauth,placeholderie],
  created () {
    this.fetchData()
  },
  mounted() {        
      let screenHeight=document.documentElement.clientHeight;
      let screenWidth=document.documentElement.clientWidth;
      this.tableHeight = screenHeight-299 +'px';
      // 然后监听window的resize事件．在浏览器窗口变化时再设置下背景图高度．
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-299}px`;
      };
  },
  computed: {
    ...mapGetters(['token', 'JSESSIONID', 'account', 'permission_routers'])
  },
  methods: {
    onSubmit: function () {
      this.fetchData();
    },
    gotoform () {
      this.disabled=false
      this.findAllChildOrgByAccount()
      this.userDialog.title="组织添加"
      this.userDialog.show=true
      // this.$router.push({path:'/system/orgDetail', query: {isEdit: false, pageName: '组织添加'}})
    },
    fetchData () {
      this.listLoading = true
      var isSupportPlaceholder = 'placeholder' in document.createElement('input')
      if(!isSupportPlaceholder){
        if(this.listQuery.keyword == '组织名称'){
          this.listQuery.keyword = ''
        }      
      }
      orgList(this.listQuery).then(response => {
        // console.log(response)
        this.list = response.data.list
        this.total = response.totalPages
        this.listLoading = false
        if(this.total > 0){
           this.pagishow = true
        }else{
          this.pagishow = false
        }
        var isSupportPlaceholder = 'placeholder' in document.createElement('input')
          if(!isSupportPlaceholder){
            if(this.listQuery.keyword == ''){
              this.listQuery.keyword = '组织名称'
            }      
          }
      })
    },
    edit: function (orgId) {
      this.userDialog.title="组织编辑"
      this.userDialog.show=true
      this.disabled=true
      this.init(orgId,this.formData)
      // this.$router.push({path:'/system/orgDetail',query: {orgId: orgId, isEdit:true, pageName: '组织编辑'}})
    },
    remove: function (orgId) {
      this.$confirm('是否确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteOrg(orgId).then(response =>{
          if(response.success){
            this.$message({
              message: response.message,
              type: 'success'
            })
            this.fetchData()
          }else{
            this.$message({
              message: response.message,
              type: 'warning'
            })
          }
        })
      })
    },
    handleSizeChange (val) {
      this.listQuery.pageSize = val
      this.fetchData()
    },
    handleCurrentChange (val) {
      this.listQuery.pageNo = val
      this.fetchData()
    },
     handleSelectionChange(val) {
      let ids = ''
      val.forEach(element => {
        ids+=element['orgId']+','
      });
      this.multipleSelection = val
    },
    init(id,that) {
        var local = this
        editOrg(id).then(response =>{
          // console.log(response)
          that.id=response.data.id
          that.orgName = response.data.orgName
          that.orgCode = response.data.orgCode
          that.isEnable = response.data.isEnable
          that.orders = response.data.orders
          that.tel = response.data.tel
          that.email = response.data.email
          that.remark = response.data.remark
          this.findAllChildOrgByAccount(response.data.parentId)
        })
        
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
          if(this.parentIds.length==0){
            this.formData.parentId =0
            this.$message({
              message: '请选择上级组织',
              type: 'warning'
            })
          }else{
            this.formData.parentId = this.parentIds[this.parentIds.length - 1]
            submitOrg(this.formData).then(response =>{
              if(response.success){
                this.$message({
                  message: response.message,
                  type: 'success'
                })
                this.$router.push({path:'/system/org'})
              }else{
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
            })
          }
          
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      // this.$router.push({path:'/system/org'})
      this.userDialog.show=false
    },
  }
}
</script>
<style lang="scss">
  .cascader-container{
    .el-cascader{
      line-height: 30px;
    }
    .el-cascader__label{
      height: 30px;
    }
  }
</style>
