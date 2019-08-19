<template>
  <div class="app-small">
    <div class="listTotal">分组管理（共{{total}}条）</div>
    <table-operate >
      <el-button type="primary" size="small"  v-if="hasAuth('groupAdd')"  @click="gotoform">添加</el-button>
      <el-button type="danger" size="small" v-if="hasAuth('groupDelete')" @click="batchRemove">删除</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="分组">
          <el-cascader
            separator=">"
            clearable
            change-on-select
            @change="handleItemChange2"
            :options="listGroups"
            :props="groupProps"
            v-model="listGroupId"
            style="width:100%"
            ref="cascader2">
          </el-cascader>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="listQuery.searchContent" clearable @focus="inputfocus('account')" @blur="inputblur('account')" placeholder="分组名称" @keyup.enter.native="doneSubmit"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
        <el-table-column type="selection" width="60" align="center"/>
        <el-table-column prop="name" label="分组名称" />
        <el-table-column prop="parentName" label="所属上级分组" min-width="180"/>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" v-if="hasAuth('groupEdit')" type="text" @click="edit(scope.row.id,scope.row.parentId,scope.row.name)">编辑</el-button>
            <el-button size="medium" style="color:#F78989" v-if="hasAuth('groupDelete')"  type="text" @click="remove(scope.row.id)">删除</el-button>
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
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="120px">
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="formData.name" ></el-input>
          </el-form-item>
          <el-form-item label="所属上级分组" prop="parentId">
            <el-cascader
              separator=">"
              clearable
              change-on-select
              @change="handleItemChange"
              :options="groups"
              v-model="groupId"
              :props="groupProps"
              style="width:100%"
              ref="cascader3">
            </el-cascader>
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
  import {btnauth} from '@/components/Mixin/btnauth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { fixie9input } from '@/components/Mixin/fixie9input'
  import {groupSelect, groupSelectEdit, groupList, groupAdd, groupEdit, groupDelete} from '@/api/group'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        oldVue:'',
        tableHeight:' ',
        nowgroups:[],
        listGroups:[],
        listGroupId:[],
        listQuery: {
          searchContent: '',
          id: '',
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
        groupId:[],
        groupProps:{
          value : "id",
          label : "name",
          children: 'childTSysGroup'
        },
        i:0,
        z:1,
        grade:'',
        level: '',
        relativeLevel:'',
        cityindex: '',
        countyindex: '',
        blockindex:'',
        unitindex:'',
        response: [],
        detailTurn:0,
        formData: {
          name: '',
          parentName: '',
          parentId:''
        },
        ieForm:{
          name: '',
          parentName: '',
        },
        rules: {
          name: [
            { required: true, message: '请输入分组名称', trigger: 'blur' }
          ],
          parentId: [
            { required: true, message: '请选择所属上级分组', trigger: 'change'}
            ]
        }
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
      this.tableHeight = screenHeight-352 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-352}px`;
      };
      this.groupChange('')
      this.listGroupsChange('')
    },
    methods: {
      groupChange2(id){
        groupSelectEdit(id).then(response => {
          this.level = response.data[0].grade
          this.groups=response.data
          this.nowgroups=response.data
          var idsLength=response.data[0].ids.length
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
                  this.$refs.cascader3.menuVisible=true
                }
            }, 5);
            this.i++
            if(this.relativeLevel === ''){
               this.relativeLevel = response.data[0].grade-1;
            }
            var actuallevel = 5 - this.relativeLevel;
            this.level = response.data[0].grade-this.relativeLevel
            this.response[this.level - 1] = response.data
      
            if (this.level < actuallevel) {
              for(let i=0;i<response.data.length;i++){
                response.data[i].childTSysGroup=[]
              }
            }
            // console.log(this.level)
            if (this.level <= actuallevel) {
              if (this.level === 2) {
                this.cityindex = this._.findIndex(this.response[0], [
                  'id',
                  id,
                ])
                if(this.nowgroups.length >0 ){
                  this.nowgroups[this.cityindex].childTSysGroup = response.data
                }else{
                  this.nowgroups = response.data
                  this.cityindex = 0
                }
              } else if (this.level === 3) {
                this.countyindex = this._.findIndex(this.response[1], [
                  'id',
                  id,
                ])
                if(this.response[1]){
                  if(this.nowgroups[this.cityindex].childTSysGroup.length > 0){
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                  }else{
                    this.nowgroups[this.cityindex].childTSysGroup = response.data
                  }
                }else{
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup = response.data
                }


              } else if (this.level === 4) {
                this.blockindex = this._.findIndex(this.response[2], [
                  'id',
                  id,
                ])
                // console.log(this.response[1])
                // console.log(this.response[2])
                if(this.response[1]&&this.response[2]){
                  if(this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup.length > 0){
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                  }else{
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                  }
                }else if(!this.response[1]&&!this.response[2]){
                  // console.log(111)
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup[0].childTSysGroup = response.data
                }else if(!this.response[1]&&this.response[2]){
                  // console.log(222)
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.countyindex = this._.findIndex(this.response[1], [
                    'id',
                    ids[1],
                  ])
                  this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup[this.blockindex].childTSysGroup = response.data
                }

              } else if (this.level === 5) {
                this.unitindex = this._.findIndex(this.response[3], [
                  'id',
                  id,
                ])
                if(this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup.length > 0){
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup = response.data
                }else{
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup =null
                }

              }  else {
                this.nowgroups = response.data
              }
              
              this.groups = this.nowgroups
              
            } else {
              return 0
            }
          }
        })
      },
      // 上级分组
      handleItemChange(val) {
        // console.log(val)
        var id=val[val.length-1]
        this.groupChange(id,val)
        this.formData.parentId=this.groupId[this.groupId.length-1]
      },
      // 分组查询
      handleItemChange2(val) {
        var id=val[val.length-1]
        this.listGroupsChange(id)
      },
      listGroupsChange(id,ids){
        groupSelect(id).then(response => {
          if(response.data.length>0){
            if(this.z==1){
              this.grade=response.data[0].grade-1
              this.z++
            }
            this.level = response.data[0].grade-this.grade
            var actuallevel=5-this.grade
            this.response[this.level - 1] = response.data
            if (this.level < actuallevel) {
              for(let i=0;i<response.data.length;i++){
                response.data[i].childTSysGroup=[]
              }
            }
      
            if (this.level < actuallevel) {
              for(let i=0;i<response.data.length;i++){
                response.data[i].childTSysGroup=[]
              }
            }
            // console.log(this.level)
            if (this.level <= actuallevel) {
              if (this.level === 2) {
                this.cityindex = this._.findIndex(this.response[0], [
                  'id',
                  id,
                ])
                if(this.nowgroups.length >0 ){
                  this.nowgroups[this.cityindex].childTSysGroup = response.data
                }else{
                  this.nowgroups = response.data
                  this.cityindex = 0
                }
              } else if (this.level === 3) {
                this.countyindex = this._.findIndex(this.response[1], [
                  'id',
                  id,
                ])
                if(this.response[1]){
                  if(this.nowgroups[this.cityindex].childTSysGroup.length > 0){
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                  }else{
                    this.nowgroups[this.cityindex].childTSysGroup = response.data
                  }
                }else{
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup = response.data
                }


              } else if (this.level === 4) {
                this.blockindex = this._.findIndex(this.response[2], [
                  'id',
                  id,
                ])
                if(this.response[1]&&this.response[2]){
                  if(this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup.length > 0){
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                  }else{
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                  }
                }else if(!this.response[1]&&!this.response[2]){
                  // console.log(111)
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup[0].childTSysGroup = response.data
                }else if(!this.response[1]&&this.response[2]){
                  // console.log(222)
                  this.cityindex = this._.findIndex(this.response[0], [
                    'id',
                    ids[0],
                  ])
                  this.countyindex = this._.findIndex(this.response[1], [
                    'id',
                    ids[1],
                  ])
                  this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup[this.blockindex].childTSysGroup = response.data
                }

              } else if (this.level === 5) {
                this.unitindex = this._.findIndex(this.response[3], [
                  'id',
                  id,
                ])
                if(this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup.length > 0){
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup = response.data
                }else{
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup =null
                }

              }  else {
                this.nowgroups = response.data
              }
              this.listGroups = this.nowgroups
            } else {
              return 0
            }
          }
        })
      },
      gotoform() {
        setTimeout(()=>{
          this.$refs.userForm.resetFields();
        },10)
        this.userDialog.title="新增分组"
        this.userDialog.show=true
        this.groupId=[]
        this.formData={
          name: '',
          parentName: '',
          parentId:''
        }
        // this.groupChange('',2)
      },
      doneSubmit: function () {
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        this.listQuery.id=this.listGroupId[this.listGroupId.length-1]
        groupList(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if (this.total > 0) {
            this.pagishow = true
          }
        })
      },
      edit: function (id,parentId,name) {
        this.userDialog.title="分组编辑"
        this.userDialog.show=true
        this.response=[]
        setTimeout(()=>{
          this.$refs.userForm.resetFields();
          this.init(id,parentId,name)
        },10)
      },
      remove: function (id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          groupDelete(id).then(response => {
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
          this.$confirm('是否确定删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            groupDelete(this.multipleSelection).then(response => {
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
            message: '请选择需要删除的分组',
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
      // 分组详情
      init: function (id,parentId,name) {
        var local = this
        this.formData.id = id
        this.formData.name = name
        this.groupChange2(parentId)
      },
      submitForm (formName) {
        this.formData.parentId=this.groupId[this.groupId.length-1]
        this.$refs[formName].validate(valid => {
          if (valid) {
            if (this.userDialog.title == "新增分组") {
              var params = {};
              params.name = this.formData.name;
              params.parentId = this.formData.parentId;
              groupAdd(params).then(response => {
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
            } else if(this.userDialog.title == "分组编辑"){
              var params = {};
              params.name = this.formData.name;
              params.parentId = this.formData.parentId;
              params.id = this.formData.id;
              groupEdit(params).then(response => {
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
