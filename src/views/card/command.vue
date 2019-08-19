<template>
  <div class="app-small">
    <table-operate >
      <el-button type="primary" size="small" v-if="hasAuth('commandAdd')"  @click="gotoform">添加</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyWord" clearable placeholder="指挥机名称/Ip地址" @keyup.enter.native="doneSubmit"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
        <el-table-column prop="name" label="指挥机名称"  min-width="120"/>
        <el-table-column prop="ip" label="Ip地址" min-width="120" />
        <el-table-column prop="icCode" label="ic卡号" min-width="80"/>
        <el-table-column prop="curTimer" label="执行间隔（s）" width="120"/>
        <el-table-column prop="enableFlag" label="启用状态" width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.enableFlag == 1" style="color:#00CC33">启用</div>
            <div v-else style="color:#FF3366">停用</div>
          </template>
        </el-table-column>
        <el-table-column prop="randomFlag" label="负载状态" width="120">
            <template slot-scope="scope">
              <div v-if="scope.row.randomFlag == 1" style="color:#00CC33">允许负载</div>
              <div v-else style="color:#FF3366">不允许负载</div>
            </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180"/>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" type="text" v-if="hasAuth('commandEdit')" @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="medium" style="color:#F78989" type="text" v-if="hasAuth('commandDelete')" @click="remove(scope.row.id)">删除</el-button>
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
               <el-form-item label="指挥机名称" prop="name">
                <el-input v-model="formData.name" ></el-input>
               </el-form-item>
               <el-form-item label="Ip地址" prop="ip">
                <el-input v-model="formData.ip" ></el-input>
               </el-form-item>
               <el-form-item label="IC卡号" prop="icCode">
                <el-input v-model="formData.icCode" ></el-input>
               </el-form-item>
               <el-form-item label="执行间隔(s)" prop="curTimer">
                <el-input v-model="formData.curTimer" ></el-input>
                </el-form-item>
               <el-form-item label="启用状态" prop="enableFlag">
                  <el-select v-model="formData.enableFlag" placeholder="请选择启用状态">
                     <el-option v-for="item in enableFlagOptions" :key="item.key" :label="item.value" :value="item.key">
                     </el-option>
                  </el-select>
              </el-form-item>
               <el-form-item label="负载状态" prop="randomFlag">
                  <el-select  placeholder="请选择负载状态" v-model="formData.randomFlag">
                     <el-option v-for="item in randomFlagOptions" :key="item.key" :label="item.value" :value="item.key">
                      </el-option>
                  </el-select>
               </el-form-item>

              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model="formData.remark" placeholder="备注长度不能超过 200 字"></el-input>
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
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import {mapGetters} from 'vuex'
  import {getCommandCardList,addCommandCard,commandCardInfo,deleteCommandCard,editCommandCard} from '@/api/command'
  import {btnauth} from '@/components/Mixin/btnauth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { fixie9input } from '@/components/Mixin/fixie9input'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        tableHeight:' ',
        listQuery: {
          keyWord:'',
          pageNo: 1,
          pageSize: 10
        },
        formData:{
          id:'',
          name:'',
          ip:'',
          icCode:'',
          curTimer:'',
          enableFlag:'',
          randomFlag:'',
          remark:''
        },
        enableFlagOptions:[
          {key:1,value:'启用'},
          {key:0,value:'停用'}
        ],
        randomFlagOptions:[
          {key:1,value:'允许负载'},
          {key:0,value:'不允许负载'}
        ],
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        rules: {
          name: [
            { required: true, message: '请输入指挥机名称', trigger: 'blur' }
          ],
          ip: [
            { required: true, message: '请输入Ip地址', trigger: 'blur' }
          ],
          icCode: [
            { required: true, message: '请输入IC卡号', trigger: 'blur' }
          ],
          curTimer: [
            { required: true, message: '请输入执行间隔(s)', trigger: 'blur' }
          ],
          enableFlag: [
            { required: true, message: '请选择启用状态', trigger: 'blur' }
          ],
          randomFlag: [
            { required: true, message: '请选择负载状态', trigger: 'blur' }
          ]
        },
        total: 1000,
        list: null,
        listLoading: true,
        currentPage: 1,
        pagishow: false,
        multipleSelection: [],
        isEdit:false,
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],
    created() {
      this.fetchData()
    },
    mounted() {
      let screenHeight=document.documentElement.clientHeight;
      this.tableHeight = screenHeight-305 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-305}px`;
      };
      this.fetchData()
    },
    methods: {
      doneSubmit: function () {
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        getCommandCardList(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if (this.total > 0) {
            this.pagishow = true
          }
        })
      },
      gotoform(){
        this.formData.id='',
        this.formData.name='',
        this.formData.ip='',
        this.formData.icCode='',
        this.formData.curTimer='',
        this.formData.enableFlag='',
        this.formData.randomFlag='',
        this.formData.remark=''

        this.userDialog.title='指挥机新增'
        this.userDialog.show=true
      },
      submitForm(formName){
          this.$refs[formName].validate(valid => {
              if (valid) {
                if(this.formData.id){//编辑
                  editCommandCard(this.formData).then(response =>{
                      if(response.success){
                          this.$message({
                            message: response.message,
                            type: 'success'
                          })
                          this.userDialog.show=false
                          this.fetchData()
                      }else{
                        this.$message({
                          message: response.message,
                          type: 'warning'
                        })
                      }
                  })
                }else{//新增
                  addCommandCard(this.formData).then(response =>{
                      if(response.success){
                          this.$message({
                            message: response.message,
                            type: 'success'
                          })
                          this.userDialog.show=false
                          this.fetchData()
                      }else{
                        this.$message({
                          message: response.message,
                          type: 'warning'
                        })
                      }
                  })
                }
              }
          })
      },
      edit(id) {
       this.userDialog.title='指挥机编辑'
       this.userDialog.show=true
       this.init(id);
      },
      init(id){
          commandCardInfo(id).then(response =>{
              if(response.success){
                  this.formData.id=response.data.id,
                  this.formData.name=response.data.name,
                  this.formData.ip=response.data.ip,
                  this.formData.icCode=response.data.icCode,
                  this.formData.curTimer=response.data.curTimer,
                  this.formData.enableFlag=response.data.enableFlag,
                  this.formData.randomFlag=response.data.randomFlag,
                  this.formData.remark=response.data.remark
              }else{
                this.$message({
                  message: response.message,
                  type: 'warning'
                })
              }
          })
      },
      remove(id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCommandCard(id).then(response => {
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
      resetForm(formName){
        this.userDialog.show=false
        this.$refs[formName].resetFields();
      }
    }
  }
</script>
<style lang="scss">

</style>
