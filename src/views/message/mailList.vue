<template>
  <div class="app-small" style="background:#fff;">
    <div class="listTotal">通讯录（共{{total}}个联系人）</div>
    <div class="mail-list" :style="{height:treeHeight}">
        <h3 class="header">分组</h3>
        <span class="add-group" @click="addGroup" v-if="hasAuth('message:mailGroup')">新建</span>
        <div class="tree-search">
            <el-input placeholder="查找分组" v-model="filterText" clearable></el-input>
        </div>
        <GeminiScrollbar :style="{maxHeight:contractHeight}">
        <ul class="conGroupList" style="padding-right:8px">
            <li @click="conGroupCheck(index,item.id)" :class="{active:currentIndex===index}" v-for="(item,index) in contractFilterData">{{item.groupName}}<span>（{{item.size}}）</span></li>
        </ul>
        </GeminiScrollbar>
    </div>

    <div class="mail-table">
        <table-operate >
            <el-button type="primary" size="small" @click="addPeople" v-if="hasAuth('mailContractAdd')">新增联系人</el-button>
            <el-popover
                placement="bottom"
                trigger="click"
                v-model="visible2">
                <ul class="searchGroupList" style="max-height:390px;overflow-y: auto;">
                    <li @click="searchGroupCheck(item.id)" v-for="(item,index) in contractFilterData">{{item.groupName}}</li>
                </ul>
                <el-button type="primary" size="small" slot="reference" v-if="hasAuth('mailGroupTrant')">移动到分组<i class="el-icon-caret-bottom el-icon--right"></i></el-button>
            </el-popover>
            <el-button type="danger" size="small" v-if="hasAuth('mailDelete')" @click="batchRemove">删除</el-button>
        </table-operate>
        <table-search>
        <el-form :inline="true" :model="listQuery" class="demo-form-inline">
            <el-form-item label="关键字">
            <el-input v-model="listQuery.keyWord" clearable placeholder="姓名/号码" @keyup.enter.native="doneSubmit"/>
            </el-form-item>
            <el-form-item>
            <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
            </el-form-item>
        </el-form>
        </table-search>
        <div class="app-container">
            <el-table style="with:100%;margin-left: -1px;" :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe >
                <el-table-column type="selection" width="60" align="center"/>
                <el-table-column prop="name" label="姓名" width="120"/>
                <el-table-column prop="contractNum" label="号码" />
                <el-table-column prop="groupName" label="所属分组" min-width="180"/>
                <el-table-column label="操作" align="center" width="180">
                <template slot-scope="scope">
                    <el-button size="medium" style="color:#4687BE" type="text" @click="editPeople(scope.row)" v-if="hasAuth('mailEdit')">编辑</el-button>
                    <el-button size="medium" style="color:#F78989" type="text" @click="remove(scope.row.id)" v-if="hasAuth('mailDelete')">删除</el-button>
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
    <el-dialog
      :title="userDialog.title"
      :visible.sync="userDialog.show"
      width="580px">
      <el-row>
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" ></el-input>
          </el-form-item>
          <el-form-item label="号码" prop="contractNum">
            <el-input v-model="formData.contractNum" ></el-input>
          </el-form-item>
          <el-form-item label="选择组" prop="contractGroupId">
              <el-select v-model="formData.contractGroupId" placeholder="选择分组">
                <el-option
                    v-for="item in contractData"
                    :key="item.id"
                    :label="item.groupName"
                    :value="item.id">
                </el-option>
            </el-select>
            <!-- <el-input v-model="formData.contractGroupId" ></el-input> -->
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
import {contractList,contractAdd,contractSubmit, contractInfo, contractDelete,updateGroupContract,findListByTreeTogether} from '@/api/mail'
import { validateNumber} from '@/utils/validate'
export default {
    components: {
        TableOperate,
        TableSearch,
        TablePagination
    },
    data() {
        var validPhone=(rule, value,callback)=>{
           if (value&&!validateNumber(value)){
               callback(new Error('请输入正确的手机号码或者北斗卡号！'))
             }else {
                 callback()
             }
           }

        return {
            visible2:false,
            tableHeight:' ',
            treeHeight:'',
            contractHeight:'',
            listQuery: {
                keyWord: '',
                contractGroupId: '',
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
            contractFilterData: [],
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
                id:'',
                name:'',
                contractNum :'',
                contractGroupId :''
            },
            currentIndex:'',
            rules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                contractNum: [
                    { validator:validPhone,trigger: 'blur'},
                    { required: true,min:7,max:11,message: '请输入7~11位数字', trigger: 'blur' }
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
        this.tableHeight = screenHeight-352 +'px';
        this.treeHeight=screenHeight-180 +'px';
        this.contractHeight =screenHeight-340 +'px';
        const that = this;
        window.onresize = function temp() {
            that.tableHeight = `${document.documentElement.clientHeight-352}px`;
            that.treeHeight = `${document.documentElement.clientHeight-180}px`;
            that.contractHeight = `${document.documentElement.clientHeight-340}px`;
        };

    },
   watch: {
      filterText(val) {
        if(val != ''){
      　　this.contractFilterData = this.contractFilterData.filter(item=>{
      　　  return item.info.indexOf(val) !== -1;
      　  });
        }else{
          this.contractFilterData = this.contractData
        }
      }
    },
    methods: {
        conGroupCheck(index,id){
            if(this.currentIndex === index){
              this.currentIndex=''
              this.listQuery.contractGroupId=''
            }else{
              this.currentIndex=index;
              this.listQuery.contractGroupId=id
            }
             this.fetchData()
        },
        searchGroupCheck(id){
            this.visible2=false
            if (this.multipleSelection.length > 0) {
                var params = {
                    groupId:id,
                    ids:this.multipleSelection
                };
                updateGroupContract(params).then(response => {
                    if (response.success) {
                        this.$message({
                            message: response.message,
                            type: 'success'
                        })
                        this.multipleSelection = []
                        this.handleSelectionChange(this.multipleSelection)
                        this.fetchData()
                        this.findListByTreeTogether()
                    } else {
                        this.$message({
                            message: response.message,
                            type: 'warning'
                        })
                    }
                })
            } else {
                this.$message({
                    message: '请选择需要移动的联系人',
                    type: 'warning'
                })
            }

        },
        // 查找通讯录
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        // 通讯录加载
        findListByTreeTogether(){
            findListByTreeTogether().then(response=>{
                this.contractData=response.data;
                this.contractFilterData=response.data;
                for(var i = 0;i<this.contractFilterData.length;i++){
                  if(this.contractData[i].contractChild && this.contractData[i].contractChild.length>0){
                      this.contractFilterData[i].size =  this.contractData[i].contractChild.length
                  }else{
                      this.contractFilterData[i].size = 0
                  }

                }
            })
        },
        init: function (data) {
            var local = this
            this.formData={
                id:data.id,
                name:data.name,
                contractNum :data.contractNum,
                contractGroupId :data.contractGroupId
            }
        },
        addPeople(){
            this.userDialog.title="新增联系人"
            this.userDialog.show=true
            this.formData={
                name:'',
                contractNum :'',
                contractGroupId :''
            }
        },
        editPeople(data){
            this.userDialog.title="联系人编辑"
            this.userDialog.show=true
            this.init(data)
        },
        addGroup(){
            this.$router.push({path:'/message/mailList/mailGroup'})
        },
        submitForm(formName){
            this.$refs[formName].validate(valid => {
                if (valid) {
                    if (this.userDialog.title == "新增联系人") {
                        var params = {
                            name:this.formData.name,
                            contractNum :this.formData.contractNum,
                            contractGroupId :this.formData.contractGroupId
                        };
                        contractAdd(params).then(response => {
                            if (response.success) {
                                this.$message({
                                    message: response.message,
                                    type: 'success'
                                })
                                this.userDialog.show = false
                                this.fetchData()
                                this.findListByTreeTogether();
                            } else {
                                this.$message({
                                    message: response.message,
                                    type: 'warning'
                                })
                            }
                        })
                    } else if(this.userDialog.title == "联系人编辑"){
                        contractSubmit(this.formData).then(response => {
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
            contractList(this.listQuery).then(response => {
                this.list = response.data.list
                this.total = response.data.totalCount
                this.listLoading = false
                if (this.total > 0) {
                    this.pagishow = true
                }
            })
        },
        remove(id) {
            this.$confirm('是否确定删除？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                contractDelete(id).then(response => {
                    if (response.success) {
                        this.$message({
                            message: response.message,
                            type: 'success'
                        })
                        this.fetchData()
                        this.findListByTreeTogether()
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
                    contractDelete(this.multipleSelection).then(response => {
                        if (response.success) {
                            this.$message({
                                message: response.message,
                                type: 'success'
                            })
                            this.multipleSelection = []
                            this.handleSelectionChange(this.multipleSelection)
                            this.fetchData()
                            this.findListByTreeTogether()
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
                    message: '请选择需要删除的联系人',
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
    border-right: 1px solid #dcdfe6;
    position: relative;
    .add-group{
        position: absolute;
        z-index: 2;
        top: 20px;
        right: 10px;
        font-size: 14px;
        color: #2975E6;
        cursor: pointer;
    }
    .header{
        font-size: 14px;
        text-align: center;
        font-weight: normal;
        height: 56px;
        margin: 0 auto;
        line-height: 56px;
    }
    .tree-search{
        background: #F1F3F5;
        padding: 13px;
        input{
            width: 100%;
            height: 30px;
            border: 0;
            text-align: center;
            line-height: 30px;
        }
    }
    .conGroupList{
        list-style: none;
        margin: 0;
        padding: 0;
        li{
            height: 40px;
            line-height: 40px;
            padding: 0 20px;
            color: #555555;
            font-size: 14px;
            cursor: pointer;
        }
        li.active{
            background-color: #2975E6!important;
            color: #fff;
        }


        li span{
            color: #0000FF;
        }
        li.active span{
            color: #fff;
        }
        li:nth-child(odd){
            background-color: #F4F8FC;
        }
        li:nth-child(even){
            background-color: #fff;
        }
    }
}
.mail-table{
    width:  calc(100% - 245px);
    float: left;

}
.el-popper{
    padding: 0;
}
.searchGroupList{
    list-style: none;
    margin: 0;
    padding: 0;
    li{
        line-height: 30px;
        padding: 0 20px;
        color: #555555;
        font-size: 14px;
        cursor: pointer;
    }
    li:hover{
        background-color: #2975E6!important;
        color: #fff;
    }
}
</style>
