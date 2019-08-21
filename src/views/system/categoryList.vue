<template>
  <div class="app-small">
    <table-operate>
      <el-button type="primary" size="small"  v-if="hasAuth('cateAdd')" @click="gotoform">添加</el-button>
      <!-- <el-button type="danger" size="small" @click="batchRemove">删除</el-button> -->
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyWords" clearable placeholder="字典编码/字典名称/描述" @keyup.enter.native="onSubmit"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
        </el-form-item>
        <!--<el-form-item>
          <el-button type="primary" size="small" @click="onRefresh">字典列表更新</el-button>
        </el-form-item>-->
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit stripe
                style="with:100%">
        <!-- <el-table-column prop="id" label='主键' style="width:10%"></el-table-column> -->
        <el-table-column prop="dicKey" label="字典编码" style="width:15%"></el-table-column>
        <el-table-column prop="dicValue" label="字典名称" style="width:15%"></el-table-column>
        <el-table-column prop="isEnable" label="启用" style="width:10%">
          <template slot-scope="scope">
            <div v-if="scope.row.isEnable == 1">启用</div>
            <div v-else>停用</div>
          </template>
        </el-table-column>
        <el-table-column prop="sortNo" label="排序" style="width:25%"></el-table-column>
        <el-table-column prop="remark" label="描述" style="width:25%"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="medium" type="text"  v-if="hasAuth('cateMessage')" @click="toDarDetail(scope.row.id)">详情</el-button>
            <el-button size="medium" type="text"  v-if="hasAuth('cateEdit')" @click="toDarAdd(scope.row.id)">编辑</el-button>
            <el-button size="medium" style="color:#F78989" type="text" v-if="hasAuth('cateDelete')" @click="remove(scope.row.id)">删除</el-button>
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
          <el-form-item label="字典编码" prop="dicKey">
            <el-input v-model="formData.dicKey" :disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="字典名称" prop="dicValue">
            <el-input v-model="formData.dicValue"></el-input>
          </el-form-item>
          <el-form-item label="启用" prop="isEnable">
            <el-select v-model="formData.isEnable" placeholder="">
              <el-option v-for="item in stats" :key="item.statusId" :label="item.statusName" :value="item.statusId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input v-model="formData.sortNo" ></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="备注长度不能超过 300 字"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
            <el-button @click="resetForm">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-dialog>


    <el-dialog
      :title="categoryDialog.title"
      :visible.sync="categoryDialog.show"
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="字典编码" prop="dicKey">
            <el-input v-model="formData.dicKey"></el-input>
          </el-form-item>
          <el-form-item label="字典名称" prop="dicValue">
            <el-input v-model="formData.dicValue"></el-input>
          </el-form-item>
          <el-form-item label="启用" prop="isEnable">
            <el-select v-model="formData.isEnable" placeholder="">
              <el-option v-for="item in stats" :key="item.statusId" :label="item.statusName" :value="item.statusId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input v-model="formData.sortNo" ></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input type="textarea" v-model="formData.remark" placeholder="备注长度不能超过 300 字"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAddForm('userForm')">保存</el-button>
        <el-button @click="resetForm('userForm')">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import store from '@/store'
  import { formatDate } from '@/api/date'
  import {dictionaryList,deleteCategory,refresh,submitCategory,detailCategory,submitAddCategory} from '@/api/dataDar'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import TableOperate from '@/components/Table/Operate'
  import {btnauth} from '@/components/Mixin/btnauth'
  import { isvalidPhone, validateNumberAndEnglish } from '@/utils/validate'
  export default {
    inject:['reload'],
    components: {
      TableSearch,
      TablePagination,
      TableOperate
    },
    data () {

      var validateAccount = (rule, value, callback) => {
        if(!validateNumberAndEnglish(value)){
          callback(new Error('请输入数字或英文!'))
        }else{
          callback()
        }
      }

    var validateAccount2 = (rule, value, callback) => {
              //if(!validateNumberAndEnglish(value)&&value!=''){
              if(!new RegExp(/^[0-9]+$/).test(value)){
                callback(new Error('请输入数字!'))
              }else if(value.length>10){
                callback(new Error('位数不能超过10位'))
              }
              //else if(value.subString(0,1)=="0" || value.subString(0,1)==0 ){
                //callback(new Error('首位不能是0!'))
              //}
              else{
                callback()
              }
          }

      return {
        tableHeight:' ',
        listQuery: {
          keyword:null,
          pageSize:10,
          pageNo:1
        },
        list: null,
        listLoading: true,
        currentPage: 1,
        pagishow: false,
        total : '',
        timeValue: {},
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        categoryDialog: {
          show:false,
          title:''
        },
        orgs:[],
        roles:[],
        stats:[
          {
          "statusId": 1,
          "statusName": "启用"
          }, {
          "statusId": 0,
          "statusName": "停用"
          }
        ],
        disabled:true,
        formData: {
          id:'',
          dicKey: '',
          dicValue: '',
          isEnable: 1,
          sortNo: '',
          remark: ''
        },
        ieForm:{
          pass: '',
          password: '',
          realName: '',
          tel: '',
          email: ''
        },
        rules: {
          dicKey: [
            { required: true, message: '请输入字典编码', trigger: 'blur' },
            { min: 0, max: 20, message: '请保持长度在 20 位及以下', trigger: 'blur' },
            {validator: validateAccount, trigger: 'blur' }
          ],
          dicValue: [
              { required: true, message: '请输入字典名称', trigger: 'blur' },
              { min: 0, max: 20, message: '请保持长度在 20 位及以下', trigger: 'blur'}
          ],
          isEnable: [
            { required: true, message: '请选择是否启用', trigger: 'blur' },
          ],
          sortNo: [
              { required: true, message: '请输入排序', trigger: 'blur' },
              {validator: validateAccount2, trigger: 'blur' }
          ]
        }
      };
    },
    filters: {
        formatDate(time) {
          var date = new Date(time);
          return formatDate(date, 'yyyy-MM-dd hh:mm');
        }
    },
    mixins: [btnauth],
    created () {
      if(this.$route.query.pageNo){
            this.listQuery.pageNo=this.$route.query.pageNo
            this.currentPage=this.$route.query.pageNo
        }
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
      fetchData () {
        this.listLoading = true
        dictionaryList(this.listQuery).then(response => {
          // console.log(response)
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if(this.total > 0){
            this.pagishow = true
          }else{
            this.pagishow = false
          }
        })
      },
      gotoform(id) {
        this.formData.id=''
        this.formData.dicKey=''
        this.formData.dicValue=''
        this.formData.isEnable=''
        this.formData.sortNo=''
        this.formData.remark=''
        this.categoryDialog.title="数据字典类别添加"
        this.categoryDialog.show=true
        // this.$router.push({path: '/system/categoryDetail', query: {isEdit: false, pageName: '数据字典类别添加'}})
      },
      toDarAdd(id) {
        this.init(id,this.formData)
        this.userDialog.title="数据字典类别编辑"
        this.userDialog.show=true
        // this.$router.push({path: '/system/categoryDetail', query: {id: id,isEdit: false, pageName: '数据字典类别编辑'}})
      },
      toDarDetail(id) {
        this.$router.push({path: '/system/dicList', query: {id: id,pageNo:this.listQuery.pageNo,isEdit: false, pageName: '数据字典类别列表'}})
      },
      onRefresh(){
        refresh().then(response=>{
          if (response.success) {
            store.dispatch('AllDic').then(res => {})
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
      },
      remove: function (id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCategory(id).then(response => {
            if (response.success) {
              //this.list.splice(index,1)
              this.fetchData
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
          this.$confirm('是否确定删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteCategory(this.multipleSelection).then(response => {
              if (response.success) {
                // this.multipleSelection.forEach(element =>{
                //   var index = this._.findIndex(this.list, ['accountId', element])
                //   this.list.splice(index,1)
                // })
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
            message: '请选择需要删除的选择',
            type: 'warning'
          })
        }
      },
      onSubmit: function () {
        this.fetchData()
      },
      handleSizeChange (val) {
        this.listQuery.pageSize = val;
        this.fetchData();
      },
      handleCurrentChange (val) {
        this.listQuery.pageNo = val
        this.fetchData();
      },
      init: function (id,that) {
        var local = this
        detailCategory(id).then(response =>{
            // console.log(response)
            that.id=response.data.id
            that.dicKey=response.data.dicKey
            that.dicValue=response.data.dicValue
            that.isEnable=response.data.isEnable
            that.sortNo=response.data.sortNo
            that.remark=response.data.remark
        })
      },
      submitForm (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            submitCategory(this.formData).then(response =>{
              if(response.success){
                this.$message({
                  message: response.message,
                  type: 'success'
                })
                this.$router.push({path:'/system/categoryList'})
                this.userDialog.show=false
                this.fetchData();
              }else{
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
            })
          } else {
            //console.log('error submit!!')
            return false
          }
        })
      },
      submitAddForm (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            submitAddCategory(this.formData).then(response =>{
              if(response.success){
                this.$message({
                  message: response.message,
                  type: 'success'
                })
                //this.$router.push({path:'/system/categoryList'})
                this.categoryDialog.show=false
                this.fetchData();
              }else{
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
            })
          } else {
            //console.log('error submit!!')
            return false
          }
        })
      },
      resetForm (formName) {
        this.categoryDialog.show=false
        this.userDialog.show=false
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss">
.search-time{
    .el-date-editor .el-range-separator{
      padding: 0;
      line-height: 24px;
    }
    .el-date-editor .el-range__icon{
      line-height: 24px;
    }
    .el-date-editor .el-range__close-icon{
      line-height: 24px;
    }
}

</style>

