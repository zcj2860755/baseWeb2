<template>
  <div class="app-small">
    <table-operate>
      <el-button type="primary" size="small" @click="gotoForm">添加</el-button>
      <el-button type="danger" size="small" @click="comeBack">返回</el-button>
    </table-operate>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit stripe
                style="with:100%">
        <el-table-column prop="categoryName" label='类别名称' style="width:10%"></el-table-column>
        <el-table-column prop="dicValue" label="字典编码" style="width:15%"></el-table-column>
        <el-table-column prop="dicKey" label="字典名称" style="width:15%"></el-table-column>
        <el-table-column prop="isEnable" label="启用" style="width:10%">
          <template slot-scope="scope">
            <div v-if="scope.row.isEnable == 1">启用</div>
            <div v-else>停用</div>
          </template>
        </el-table-column>
        <el-table-column prop="sortNo" label="排序" style="width:10%"></el-table-column>
        <el-table-column prop="remark" label="描述" style="width:25%"></el-table-column>
        <el-table-column label="操作" style="width:10%" align="center" >
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" type="text" @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="medium" type="text">｜</el-button>
            <el-button size="medium" style="color:#F78989" type="text" @click="remove(scope.row.id)">删除</el-button>
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
          <el-form-item label="类别名称" prop="categoryName">
            <el-input v-model="formData.categoryName" :disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="字典编码" prop="dicValue">
            <el-input v-model="formData.dicValue" :disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="字典名称" prop="dicKey">
            <el-input v-model="formData.dicKey"></el-input>
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
            <el-button @click="resetForm('userForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-dialog>

    <el-dialog
      :title="userAddDialog.title"
      :visible.sync="userAddDialog.show"
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="类别名称" prop="categoryName">
            <el-input v-model="formData.categoryName" :disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="字典编码" prop="dicValue">
            <el-input v-model="formData.dicValue"></el-input>
          </el-form-item>
          <el-form-item label="字典名称" prop="dicKey">
            <el-input v-model="formData.dicKey"></el-input>
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
  import { formatDate } from '@/api/date'
  import {dictionaryListDic,deleteDic, detailDic,submitDic,addDic,detailCategory} from '@/api/dataDar'
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import { isvalidPhone, validateNumberAndEnglish } from '@/utils/validate'
  export default {
    components: {
      TableSearch,
      TablePagination,
      TableOperate
    },
    data () {
      var validateAccount = (rule, value, callback) => {
        if(!validateNumberAndEnglish(value)&&value!=''){
          callback(new Error('请输入数字或英文!'))
        }else{
          callback()
        }
      }
      return {
        categoryId:'',
        categoryPageNo:'',
        categoryName:'',
        tableHeight:' ',
        listQuery: {
          startTime:null,
          endTime: null,
          startPage : null,
          pageSize:null
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
        userAddDialog: {
          show:false,
          title:''
        },
        disabled:true,
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
        formData: {
          id:'',
          dicKey: '',
          dicValue: '',
          categoryId:'',
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
            { required: true, message: '请输入字典名称', trigger: 'blur' },
            { min: 0, max: 20, message: '请保持长度在 20 位及以下', trigger: 'blur' }
          ],
          dicValue: [
            { required: true, message: '请输入字典编码', trigger: 'blur' },
            {validator: validateAccount, trigger: 'blur' }
          ],
          isEnable: [
            { required: true, message: '请选择是否启用', trigger: 'blur' },
          ],
          sortNo: [
            { required: true, message: '请输入排序', trigger: 'blur' },
            {validator: validateAccount, trigger: 'blur' }
          ]
        }
      };
    },
    created () {
      var id = this.$route.query.id
      this.categoryId=this.$route.query.id
      this.categoryPageNo=this.$route.query.pageNo
      var that  = this.formData
      if(id) {
        this.fetchData(id)
      }

    },
    mounted() {
        let screenHeight=document.documentElement.clientHeight;
        this.tableHeight = screenHeight-200 +'px';
        const that = this;
        window.onresize = function temp() {
          that.tableHeight = `${document.documentElement.clientHeight-200}px`;
        };
    },
    methods: {
      fetchData (id) {
        this.listLoading = true
        dictionaryListDic(id).then(response => {
          // console.log(response)
          this.list = response.data
          this.listLoading = false
          //this.categoryName=response.data[0].categoryName
        })

        detailCategory(this.categoryId).then(response => {
            this.categoryName=response.data.dicValue
        })
      },
      onSubmit: function () {
        this.fetchData()
      },
      gotoForm(){
        this.formData.id='',
        this.formData.dicKey='',
        this.formData.dicValue= '',
        this.formData.isEnable= 1,
        this.formData.sortNo= '',
        this.formData.categoryName= this.categoryName,
        this.formData.remark= '',
        this.formData.categoryId=this.categoryId
        this.userAddDialog.title="数据字典添加"
        this.userAddDialog.show=true
        // this.$router.push({path:'/system/dicDetail', query: {categoryId: this.categoryId,categoryName:this.categoryName, pageName: '数据字典添加'}})
      },
      edit: function (dicId) {
        this.userDialog.title="数据字典编辑"
        this.userDialog.show=true
        var that  = this.formData
        that.categoryId = this.categoryId
        that.categoryName = this.categoryName
        this.init(dicId,that)
        // this.$router.push({path: '/system/dicDetail', query: {categoryId: this.categoryId,dicId:dicId, pageName: '数据字典编辑'}})
      },
      remove: function (id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteDic(id).then(response => {
            if (response.success) {
              //this.list.splice(index,1)
              this.fetchData
              this.$message({
                message: response.message,
                type: 'success'
              })
              this.fetchData(this.categoryId)
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
            deleteDic(this.multipleSelection).then(response => {
              if (response.success) {
                this.fetchData(this.categoryId)
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
            message: '请选择需要删除的选项',
            type: 'warning'
          })
        }
      },
      comeBack(){
        this.$router.push({path: '/system/categoryList',query:{pageNo:this.categoryPageNo}})
      },
      handleSizeChange (val) {
        this.listQuery.pageSize = val;
        this.fetchData();
      },
      handleCurrentChange (val) {
        this.listQuery.startPage = val
        this.fetchData();
      },
      init: function (id,that) {
        var local = this
        detailDic(id).then(response =>{
          // console.log(response)
          that.id=response.data.id
          that.categoryName=response.data.categoryName
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
            let that=this
            submitDic(that.formData).then(response =>{
              if(response.success){
                that.$message({
                  message: response.message,
                  type: 'success'
                })
                //that.$router.push({path:'/sys/dic/getSysDicList?categoryId='+that.formData.categoryId})
                this.userDialog.show=false
                this.fetchData(this.categoryId)
              }else{
                that.$message({
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
            let that=this
            addDic(that.formData).then(response =>{
              if(response.success){
                that.$message({
                  message: response.message,
                  type: 'success'
                })
                //that.$router.push({path:'/sys/dic/getSysDicList?categoryId='+that.formData.categoryId})
                this.userAddDialog.show=false
                this.fetchData(this.categoryId)
              }else{
                that.$message({
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
        this.$refs[formName].resetFields();
        this.userAddDialog.show=false
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

