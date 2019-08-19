<template>
  <div class="app-small" style="background:#fff;">
    <div class="listTotal">通讯录分组（共{{total}}个）</div>
    <div class="mail-table">
        <table-operate >
            <el-button type="primary" size="small" @click="addGroup">添加</el-button>
            <el-button type="danger" size="small" @click="batchRemove">删除</el-button>
        </table-operate>
        <div class="app-container">
            <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
                <el-table-column type="selection" width="60" align="center"/>
                <el-table-column type="index" width="60" label="序号"></el-table-column>
                <el-table-column prop="groupName" label="分组名称"/>
                <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button size="medium" style="color:#4687BE" type="text" @click="editGroup(scope.row.id,scope.row.groupName)">编辑</el-button>
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
    </div>
    <div class="mail-list" :style="{height:treeHeight}">
        <h3 class="header">通讯录</h3>
        <div class="tree-search">
            <el-input placeholder="查找分组" v-model="filterText" clearable></el-input>
        </div>
        <GeminiScrollbar :style="{maxHeight:contractHeight}">
        <el-tree
            class="filter-tree"
            style="overflow-y: auto;"
            :data="contractData"
            :default-checked-keys="checkedKeys"
            :default-expanded-keys='checkedKeys'
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            ref="tree2">
            <span slot-scope="{ node, data }" >
                 <span class="el-tree-node__label">{{ data.info}}</span>
                  <span class="el-tree-node__label" style="color:#0000FF" v-if="isShow(data)">
                      （{{ data.size}}）
                  </span>
            </span>
        </el-tree>
        </GeminiScrollbar>
    </div>
    <el-dialog
      :title="userDialog.title"
      :visible.sync="userDialog.show"
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="formData.name" ></el-input>
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
import {conGroupList,conGroupAdd,conGroupSubmit, conGroupInfo, conGroupDelete,findListByTreeTogether} from '@/api/mail'
export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        tableHeight:' ',
        treeHeight:'',
        contractHeight:'',
        listQuery: {
          keyWord: '',
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
        isEdit:false,
        filterText: '',
        checkedKeys:[],
        contractData: [],
        defaultProps: {
          children: 'contractChild',
          label: 'info'
        },
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        formData: {
          name: ''
        },
        rules: {
          name: [
            { required: true, message: '请输入通讯录分组名称', trigger: 'blur' }
          ],
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
        this.findListByTreeTogether()
        let screenHeight=document.documentElement.clientHeight;
        this.tableHeight = screenHeight-300 +'px';
        this.treeHeight=screenHeight-180 +'px';
        this.contractHeight =screenHeight-365 +'px';
        const that = this;
        window.onresize = function temp() {
            that.tableHeight = `${document.documentElement.clientHeight-300}px`;
            that.treeHeight = `${document.documentElement.clientHeight-180}px`;
            that.contractHeight = `${document.documentElement.clientHeight-365}px`;
        };

    },
    watch: {
      filterText(val) {
        this.$refs.tree2.filter(val);
      }
    },
    methods: {
        // 查找通讯录
        filterNode(value, data) {
            if (!value) return true;
            return data.info.indexOf(value) !== -1;
        },
        // 通讯录加载
        findListByTreeTogether(){
            findListByTreeTogether().then(response=>{
                this.contractData=response.data
                for(var i = 0;i<this.contractData.length;i++){
                  if(this.contractData[i].isContract == 0){
                    if(this.contractData[i].contractChild && this.contractData[i].contractChild.length>0){
                        this.contractData[i].size =  this.contractData[i].contractChild.length
                    }else{
                        this.contractData[i].size = 0
                    }
                  }
                }
                //console.log(this.contractData)
            })
        },
        init: function (id,name) {
            var local = this
            this.formData.id = id
            this.formData.name = name
        },
        addGroup(){
            this.userDialog.title="新增通讯录分组"
            this.userDialog.show=true
            this.formData={
                name: ''
            }
        },
        isShow(data){
          if(data.isContract ==1){
            return false
          }
          return true
        },
        editGroup(id,name){
            this.userDialog.title="通讯录分组编辑"
            this.userDialog.show=true
            this.init(id,name)
        },
        submitForm(formName){
            this.$refs[formName].validate(valid => {
                if (valid) {
                    if (this.userDialog.title == "新增通讯录分组") {
                        var params = {};
                        params.groupName = this.formData.name;
                        conGroupAdd(params).then(response => {
                            if (response.success) {
                                this.$message({
                                    message: response.message,
                                    type: 'success'
                                })
                                this.userDialog.show = false
                                this.fetchData()
                                this.findListByTreeTogether()
                            } else {
                                this.$message({
                                    message: response.message,
                                    type: 'warning'
                                })
                            }
                        })
                    } else if(this.userDialog.title == "通讯录分组编辑"){
                        var params = {};
                        params.groupName = this.formData.name;
                        params.id = this.formData.id;
                        conGroupSubmit(params).then(response => {
                            if (response.success) {
                                this.$message({
                                    message: response.message,
                                    type: 'success'
                                })
                                this.userDialog.show = false
                                this.fetchData()
                                this.findListByTreeTogether()
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
        resetForm(formName){
            this.userDialog.show=false
            this.$refs[formName].resetFields();
        },
        doneSubmit: function () {
            this.fetchData()
        },
        fetchData() {
            this.listLoading = true
            conGroupList(this.listQuery).then(response => {
                this.list = response.data.list
                this.total = response.data.totalCount
                this.listLoading = false
                if (this.total > 0) {
                    this.pagishow = true
                }
            })
        },
        remove(id) {
            this.index = this._.findIndex(this.contractData, [
              'id',
              id,
            ])
            var msg = "是否确定删除？"
            if(this.contractData[this.index].contractChild && this.contractData[this.index].contractChild.length>0){
              msg = '选定的分组将被删除，组内联系人将会移至默认分组‘未分组联系人’，您确定要删除该分组？'
            }

            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                conGroupDelete(id).then(response => {
                    if (response.success) {
                        this.$message({
                            message: response.message,
                            type: 'success'
                        })
                        this.fetchData()
                        this.findListByTreeTogether();
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
              var msg="是否确定删除？"
              for(var i = 0;i<this.multipleSelection.length;i++){
                var id = this.multipleSelection[i]
                this.index = this._.findIndex(this.contractData, [
                   'id',
                   id,
                 ])
                 if(this.contractData[this.index].contractChild && this.contractData[this.index].contractChild.length>0){
                   msg = '选定的分组将被删除，组内联系人将会移至默认分组‘未分组联系人’，您确定要删除该分组？'
                   break
                 }
              }

            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                conGroupDelete(this.multipleSelection).then(response => {
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
        }
    }
}
</script>
<style lang="scss">
.mail-list{
    float: left;
    width: 245px;
    height: 200px;
    background-color: #fff;
    border-left: 1px solid #dcdfe6;
    position: relative;
    .add-group{
        position: absolute;
        z-index: 2;
        top: 20px;
        right: 10px;
        font-size: 14px;
        color: #2975E6;
    }
    .header{
        font-size: 14px;
        text-align: center;
        font-weight: normal;
        height: 56px;
        margin: 0 auto;
        line-height: 56px;
    }
    // .tree-search{
    //     background: #F1F3F5;
    //     padding: 13px 20px;
    //     input{
    //         width: 100%;
    //         height: 30px;
    //         border: 0;
    //         text-align: center;
    //     }
    // }
}
.mail-table{
    width:  calc(100% - 245px);
    float: left;
}
</style>
