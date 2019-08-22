<template>
  <div class="app-small">
    <div class="listTotal">项目管理（共{{total}}条）</div>
    <table-operate >
      <el-button type="primary" size="small"  v-if="hasAuth('groupAdd')"  @click="gotoform">添加</el-button>
      <el-button type="danger" size="small" v-if="hasAuth('groupDelete')" @click="batchRemove">删除</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <!--<el-form-item label="分组">-->
          <!--<el-cascader-->
            <!--separator=">"-->
            <!--clearable-->
            <!--change-on-select-->
            <!--@change="handleItemChange2"-->
            <!--:options="listGroups"-->
            <!--:props="groupProps"-->
            <!--v-model="listGroupId"-->
            <!--style="width:100%"-->
            <!--ref="cascader2">-->
          <!--</el-cascader>-->
        <!--</el-form-item>-->
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
        <el-table-column prop="proName" label="分组名称" />
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
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="项目名称" prop="proName">
            <el-input v-model="formData.proName" placeholder="请输入项目名称"></el-input>
          </el-form-item>
          <el-form-item label="上级项目" prop="cascadeId">
            <el-cascader
              separator=">"
              clearable
              change-on-select
              :options="data2"
              :props="defaultProps"
              @change="parentIdChange"
              v-model="formData.cascadeId">
            </el-cascader>
          </el-form-item>
          <el-form-item label="管理员" prop="userIds">
            <el-select v-model="formData.userIds" multiple placeholder="请选择管理员" style="width:100%">
              <!--<el-option-->
                <!--v-for="item in options"-->
                <!--:key="item.id"-->
                <!--:label="`${item.realName}（${item.account}）`"-->
                <!--:value="item.id">-->
              <!--</el-option>-->
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('userForm')">确认</el-button>
            <el-button @click="resetForm('userForm')">取消</el-button>
          </el-form-item>
        </el-form>
      </el-row>
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
  import {groupSelect, groupSelectEdit, groupList, groupAdd, groupEdit, groupDelete,projectInfo} from '@/api/group'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        data2: [],
        defaultProps: {
          children: 'childTSysProject',
          label: 'proName',
          value:'id'
        },
        proIds:[],
        options: [],
        selectList:[],
        selectName:'',
        tableHeight:' ',
        listQuery: {
          keyword: '',
          status: '',
          sex: '',
          roleId: '',
          orgId: '',
          pageNo: 1,
          pageSize: 10
        },
        total: 1000,
        list: null,
        listLoading: false,
        currentPage: 1,
        pagishow: false,
        userDialog: {
          show:false,
          title:''
        },
        stopDialog: {
          show:false,
          title:''
        },
        multipleSelection: [],
        formData: {
          id:'',
          proName: '',
          parentId: '',
          userIds: [],
          cascadeId:[]
        },
        rules: {
          proName: [
            { required: true, message: '请输入项目名称', trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie],
    created() {
      this.fetchData()
    },
    mounted() {
      let screenHeight=document.documentElement.clientHeight;
      let screenWidth=document.documentElement.clientWidth;
      this.tableHeight = screenHeight-299 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-299}px`;
      };
    },
    methods: {
      //时间格式化
      dateFormat(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
      },
      // 新增项目
      gotoform(accountId) {
        this.findList('')
        this.checkedKeys=[]
        this.userDialog.title="新增项目"
        this.userDialog.show=true
        this.formData={
          id:'',
          proName: '',
          parentId: '',
          userIds: [],
          cascadeId:[]
        }

      },
      doneSubmit: function () {
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        groupList(this.listQuery).then(response => {
          // console.log(response)
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if (this.total > 0) {
            this.pagishow = true
          }
        })
      },
      // 编辑项目
      init: function (id,that) {
        var local = this
        projectInfo(id).then(response =>{
          that.id = response.data.id
          that.parentName = response.data.parentName
          that.proName = response.data.proName
          that.userNames = response.data.userNames
          if(response.data.userIds==null||response.data.userIds==''){
            that.userIds =[]
          }else{
            that.userIds = response.data.userIds
          }
          this.findList(id)
          console.log(response.data.cascadeId)
          if(response.data.cascadeId!='[]'){
            let proIds=response.data.cascadeId.length
            that.cascadeId=response.data.cascadeId.substring(1,proIds-1).split(",")
            // console.log(that.cascadeId)
          }else{
            that.cascadeId=[]
          }

        })
      },
      parentIdChange:function(){
        // console.log(this.formData.parentId)
      },
      // 上级项目
      findList: function (id) {
        console.log("上级项目"+id)
        groupSelect(id).then(response =>{
          this.data2=response.data

          // const loop = {
          //   loopTreeItem(item,i,userRoutesItem) {
          //     userRoutesItem.push(item.id)
          //     if (item.id==id) {
          //       return i
          //     }else if (item.childTSysProject){
          //       let childrens = item.childTSysProject
          //       childrens.forEach((childone) => {
          //         loop.loopTreeItem(childone,i,userRoutesItem)
          //       })
          //     }
          //     return userRoutesItem
          //   }
          // }
          // if(id){
          //   console.log('id:'+id)
          //   for(let i in this.data2){
          //     let userRoutesItem = []
          //     var item =this.data2[i];
          //     let treenode =loop.loopTreeItem(item,i,userRoutesItem)
          //     console.log(treenode)
          //     if(treenode.indexOf(id) > -1){
          //       console.log(i)
          //       this.data2[i].childTSysProject[0].disabled=true
          //     }
          //   }
          // }


        })
      },
      edit: function (id,accountId,proName) {
        this.userDialog.title="项目编辑"
        this.userDialog.show=true
        this.formData.proName = proName
        this.init(id,this.formData)
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
          this.$confirm('确定要删除已选中的项目？', '提示', {
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
            message: '请选择需要删除的项目',
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
      submitForm (formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            if(this.formData.cascadeId.length==0){
              this.formData.parentId=0
            }else{
              let length=this.formData.cascadeId.length
              this.formData.parentId=this.formData.cascadeId[length-1].toString()
            }
            // console.log(this.formData)
            if(this.userDialog.title=="项目编辑"){
              var params={} ;
              params.id = this.formData.id;
              params.proName = this.formData.proName;
              params.parentId = this.formData.parentId;
              params.userIds = this.formData.userIds;
              params.cascadeId = this.formData.cascadeId.join(",");
              groupEdit(params).then(response =>{
                if(response.success){
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
                this.userDialog.show=false
                this.fetchData()
              })
            }else if(this.userDialog.title=="新增项目"){
              var params={} ;
              params.proName = this.formData.proName;
              params.userIds = this.formData.userIds;
              params.parentId = this.formData.parentId;
              params.cascadeId = this.formData.cascadeId.join(",");
              groupAdd(params).then(response =>{
                if(response.success){
                  this.$message({
                    message: response.message,
                    type: 'success'
                  })
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
                this.userDialog.show=false
                this.fetchData()
              })
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      submitStopForm(){
        submitRoleEdit(this.formData.status).then(response =>{
          if(response.success){
            this.$message({
              message: response.message,
              type: 'success'
            })
          }else{
            this.$message({
              message: response.message,
              type: 'warning'
            })
          }
          this.stopDialog.show=false
        })
      },
      resetForm (formName) {
        this.userDialog.show=false
        this.stopDialog.show=false
        this.$refs[formName].resetFields();
      },
    }
  }
</script>
<style lang="scss">

</style>
