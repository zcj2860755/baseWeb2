<template>
  <div class="app-small">
    <table-operate>
      <el-button type="primary" size="small"  v-if="hasAuth('baseAdd')" @click="gotoform">添加</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyword" clearable @focus="inputfocus('base')" @blur="inputblur('base')" placeholder="参数名称/备注" @keyup.enter.native="onSubmit"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit stripe style="with:100%">
        <el-table-column prop="paramsName" label="参数名称" style="width:25%"></el-table-column>
        <el-table-column prop="paramsKey" label="参数编码" style="width:10%"></el-table-column>
        <el-table-column prop="paramsValue" label="参数值" style="width:10%"></el-table-column>
        <el-table-column prop="remark" label="备注" style="width:25%"></el-table-column>
        <el-table-column label="操作" style="width:10%" align="center">
          <template slot-scope="scope">
            <el-button size="medium"  style="color:#4687BE"  v-if="hasAuth('baseEdit')" type="text" @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="medium"  style="color:#F78989"  v-if="hasAuth('baseDelete')"type="text" @click="remove(scope.row.id)">删除</el-button>
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
          <el-form-item label="参数名称" prop="paramsName">
            <el-input v-model="formData.paramsName"></el-input>
          </el-form-item>
          <el-form-item label="参数编码" prop="paramsKey">
            <el-input v-model="formData.paramsKey"></el-input>
          </el-form-item>
          <el-form-item label="参数值" prop="paramsValue">
            <el-input v-model="formData.paramsValue"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 16}"
              placeholder="请输入内容"
              v-model="formData.remark"></el-input>
          </el-form-item>
          <!-- 提交表单 -->
          <el-form-item>
            <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
            <el-button @click="resetForm">取消</el-button>
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
          <el-form-item label="参数名称" prop="paramsName">
            <el-input v-model="formData.paramsName"></el-input>
          </el-form-item>
          <el-form-item label="参数编码" prop="paramsKey">
            <el-input v-model="formData.paramsKey"></el-input>
          </el-form-item>
          <el-form-item label="参数值" prop="paramsValue">
            <el-input v-model="formData.paramsValue"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 16}"
              placeholder="请输入内容"
              v-model="formData.remark"></el-input>
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
import { baseList,baseDelete,baseDetail, baseSubmit,baseAddSubmit } from '@/api/base'
import TableOperate from '@/components/Table/Operate'
import TableSearch from '@/components/Table/Search'
import TablePagination from '@/components/Table/PagiContainer'
import { mapGetters } from 'vuex'
import { btnauth } from '@/components/Mixin/btnauth'
import { placeholderie } from '@/components/Mixin/placeholderie'
  import { isvalidPhone, validateNumberAndEnglish } from '@/utils/validate'
export default {
  components: {
    TableOperate,
    TableSearch,
    TablePagination
  },
  data () {
    var validateAccount = (rule, value, callback) => {
      if(!validateNumberAndEnglish(value)){
        callback(new Error('请输入数字或英文!'))
      }else{
        callback()
      }

    }
    return {
      tableHeight:' ',
      listQuery: {
        keyword: '',
        typeId: '',
        pageNo: 1,
        pageSize: 10
      },
      total: 1000,
      list: null,
      listLoading: true,
      currentPage: 1,
      pagishow: false,
      types: [
        {
          value: '',
          label: '所有参数类型'
        },{
          value: '00000000000000000000000000000000',
          label: '系统配置'
        }
      ],
      // 详情弹框
      userDialog: {
        show:false,
        title:''
      },

      userAddDialog: {
        show:false,
        title:''
      },
      //表单数据
      formData: {
        id: null,
        paramsName: null,
        remark: null,
        paramsValue: null,
        paramsKey:'',
      },
      //校验
      rules: {
        paramsName: [
          {required: true, message: '请输入参数名称', trigger: 'blur'},
          {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
        ],
        paramsKey: [
          {required: true, message: '请输入参数编码', trigger: 'blur'},
          {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'},
          {validator: validateAccount, trigger: 'blur' }
        ],
        paramsValue: [
          {required: true,message: '请输入参数值', trigger: 'blur'},
          {min: 1, max: 64, message: '长度在 1 到 64 个字符', trigger: 'blur'}
        ],
        remark:[
          {min: 1, max: 64, message: '长度在 1 到 30 个字符', trigger: 'blur'}
        ]
      },
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
    onSubmit: function () {
      this.fetchData()
    },
    gotoform () {
      this.userAddDialog.title="基础参数添加"
      this.userAddDialog.show=true
      this.formData.id='',
      this.formData.paramsName= '',
      this.formData.remark= '',
      this.formData.paramsValue= '',
      this.formData.paramsKey=''

      // this.$router.push({path:'/system/baseDetail', query: {isEdit: false, pageName: '基础参数添加'}})
    },
    fetchData () {
      this.listLoading = true

      baseList(this.listQuery).then(response => {
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
    edit: function (baseId) {
      // this.$router.push({path:'/system/baseDetail',query: {baseId: baseId, isEdit:true, pageName: '基础参数编辑'}})
      this.init(baseId,this.formData)
      this.userDialog.title="基础参数编辑"
      this.userDialog.show=true
    },
    remove: function (baseId) {
      this.$confirm('是否确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var index = this._.findIndex(this.list, ['baseId', baseId])
        baseDelete(baseId).then(response =>{
          if(response.success){
              this.list.splice(index,1)
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
    init: function (id,that) {
      var local = this
      baseDetail(id).then(response =>{
        // console.log(response)
        that.id = response.data.id
        that.paramsName = response.data.paramsName
        that.paramsValue = response.data.paramsValue
        that.remark = response.data.remark
        that.paramsKey = response.data.paramsKey
      })
    },
    //表单提交
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //提交后台
          var params={} ;
          params.id=this.formData.id
          params.paramsName = this.formData.paramsName;
          params.paramsKey = this.formData.paramsKey;
          params.paramsValue = this.formData.paramsValue;
          params.remark = this.formData.remark;
          // console.log(params)
          baseSubmit(params).then(response => {
            if(response.success){
              this.$message({
                message: response.message,
                type: 'success'
              })
              this.$router.push({path:'/system/base'})
              this.userDialog.show=false
              this.fetchData()
            }else{
              this.$message({
                message: response.message,
                type: 'warning'
              })
            }
          })
          // alert('submit!')
        } else {
          return false
        }
      })
    },
    //新增表单提交
    submitAddForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //提交后台
          var params={} ;
          params.id=this.formData.id
          params.paramsName = this.formData.paramsName;
          params.paramsKey = this.formData.paramsKey;
          params.paramsValue = this.formData.paramsValue;
          params.remark = this.formData.remark;
          // console.log(params)
          baseAddSubmit(params).then(response => {
            if(response.success){
              this.$message({
                message: response.message,
                type: 'success'
              })
              this.$router.push({path:'/system/base'})
              this.userAddDialog.show=false
              this.fetchData()
            }else{
              this.$message({
                message: response.message,
                type: 'warning'
              })
            }
          })
          // alert('submit!')
        } else {
          return false
        }
      })
    },
    resetForm () {
      this.$refs['userForm'].resetFields();
      this.userDialog.show=false
      this.userAddDialog.show=false
    }
  }
}
</script>
