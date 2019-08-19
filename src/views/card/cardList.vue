<template>
  <div class="app-small">
    <table-operate >
      <el-button type="primary" size="small"  v-if="hasAuth('cardAdd')" @click="gotoform">添加</el-button>
      <el-button type="danger" size="small" v-if="hasAuth('cardDelete')" @click="batchRemove">删除</el-button>
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
            style="width:300px;line-height:30px;">
          </el-cascader>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="listQuery.searchContent" clearable @focus="inputfocus('account')" @blur="inputblur('account')" placeholder="请输入姓名/IC卡号/手机号"  @keyup.enter.native="doneSubmit"/>
        </el-form-item>
        <el-form-item label="开卡时间">
          <el-date-picker
            v-model="listQuery.beginTime"
            type="date"
            value-format='yyyy-MM-dd'
            placeholder="开始日期">
          </el-date-picker>
          至
          <el-date-picker
            v-model="listQuery.endTime"
            type="date"
            value-format='yyyy-MM-dd'
            placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="即将到期">
            <el-select v-model="listQuery.dueDate" placeholder="" style="width:100%" clearable>
               <el-option v-for="item in dueDateList" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
        <el-table-column type="selection" min-width="40" align="center" :selectable="checkSelectable"/>
        <el-table-column prop="groupName" label="所属分组" min-width="150"/>
        <el-table-column prop="belongName" label="姓名/单位" min-width="85"/>
        <el-table-column prop="icCode" label="IC卡号" min-width="100"/>
        <el-table-column prop="tel" label="联系号码" min-width="110"/>
        <el-table-column prop="address" label="地址" min-width="170"/>
        <el-table-column prop="isBand" label="绑定状态" min-width="80">
            <template slot-scope="scope">
              <div v-if="scope.row.isBind == 1" style="color:#00CC33">已绑定</div>
              <div v-else style="color:#FF3366">未绑定</div>
            </template>
          </el-table-column>
        <el-table-column prop="serviceType" label="套餐" min-width="50">
          <template slot-scope="scope">
            <div v-if="scope.row.serviceType == 1">包年</div>
            <div v-else>终身</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="开卡时间" min-width="155" :formatter="dateFormat"/>
        <el-table-column prop="endTime" label="到期时间" min-width="95" :formatter="dateFormat2"/>
        <el-table-column label="操作" align="center" min-width="95">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" type="text" v-if="hasAuth('cardEdit')" @click="edit(scope.row.id)">编辑</el-button>
            <template   v-if="hasAuth('cardBind')">
              <el-button size="medium" v-if="scope.row.isBind == 1" type="text" style="color:#CCCC00"   @click="untying(scope.row.id,scope.row.icCode)">解绑</el-button>
              <el-button size="medium" v-else style="color:#F78989" type="text" @click="remove(scope.row.id)">删除</el-button>
            </template>
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
</template>

<script>
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import {mapGetters} from 'vuex'
  import {btnauth} from '@/components/Mixin/btnauth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { fixie9input } from '@/components/Mixin/fixie9input'
  import {groupSelect, groupSelectEdit, groupList} from '@/api/group'
  import {getCardList,deleteICCard,iCardUntying} from '@/api/icard'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        i:'1',
        oldVue:'',
        tableHeight:' ',
        nowgroups:[],
        listGroups:[],
        listGroupId:[],
        listQuery: {
          searchContent: '',
          id: '',
          pageNo: 1,
          pageSize: 10,
          beginTime:'',
          endTime:'',
          groupId:'',
          dueDate:''
        },
        total: 1000,
        list: null,
        listLoading: true,
        currentPage: 1,
        pagishow: false,
        multipleSelection: [],
        dueDateList:[],
        isEdit:false,
        groups:[],
        groupId:[],
        groupProps:{
          value : "id",
          label : "name",
          children: 'childTSysGroup'
        },
        level: '',
        levelAll:'0',
        relativeLevel:'0',
        cityindex: '',
        countyindex: '',
        blockindex:'',
        unitindex:'',
        response: [],
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
          parentName: [{ required: true, message: '请选择所属上级分组', trigger: 'change'}],
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
      if(document.documentElement.clientWidth<1635){
        this.tableHeight = screenHeight-345 +'px';
      }else{
        this.tableHeight = screenHeight-305 +'px';
      }

      const that = this;
      window.onresize = function temp() {
        if(document.documentElement.clientWidth<1635){
          this.tableHeight = `${document.documentElement.clientHeight-345}px`;
        }else{
          this.tableHeight = `${document.documentElement.clientHeight-305}px`;
        }
      };
      this.dueDateList=this.$store.state.allDic.allDictionary.dueDate.dictionary;
      this.groupChange('')
    },
    methods: {
      //时间格式化
      dateFormat(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
      },
      dateFormat2(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD") : "";
      },
      doneSubmit: function () {
        this.fetchData()
      },
      groupChange(id){
        groupSelect(id).then(response => {
          if(response.data.length>0){
            if(this.i == 1){
              this.relativeLevel = response.data[0].grade-1
              this.i++;
            }
            this.LevelAll=5-this.relativeLevel
            var levelAll=this.LevelAll
            this.level = response.data[0].grade-this.relativeLevel
            this.response[this.level - 1] = response.data
            if (this.level < levelAll) {
              for(let i=0;i<response.data.length;i++){
                response.data[i].childTSysGroup=[]
              }
            }
            if (this.level <= levelAll) {
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
                if(this.nowgroups[this.cityindex].childTSysGroup.length > 0){
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                }else{
                  this.nowgroups[this.cityindex].childTSysGroup = response.data
                }

              } else if (this.level === 4) {
                this.blockindex = this._.findIndex(this.response[2], [
                  'id',
                  id,
                ])
                if(this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup.length > 0){
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                }else{
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
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
      // 分组查询
      handleItemChange2(val) {
        var id=val[val.length-1]
        this.listQuery.groupId=id
        this.groupChange(id)
        this.formData.parentId=this.groupId[this.groupId.length-1]
      },
      gotoform() {
        this.$router.push({path:"/card/cardList/cardAdd"})
      },
      fetchData() {
        if(this.listQuery.beginTime){
          var sTime = new Date(this.listQuery.beginTime.replace(/-/g, '/'))
        }
        if(this.listQuery.endTime){
          var eTime = new Date(this.listQuery.endTime.replace(/-/g, '/'))
        }
        if(sTime>eTime){
          this.$message({
            message: '开始时间不能大于结束时间',
            type: 'warning'
          })
        }else{
          this.listLoading = true
          this.listQuery.id=this.listGroupId[this.listGroupId.length-1]
          getCardList(this.listQuery).then(response => {
            this.list = response.data.list
            this.total = response.data.totalCount
            this.listLoading = false
            if (this.total > 0) {
              this.pagishow = true
            }
          })
        }
      },
      edit: function (id) {
        //打开IC卡编辑页面
        this.$router.push({path:"/card/cardList/cardEdit", query: {id: id}})
      },
      remove: function (id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteICCard(id).then(response => {
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
      untying: function (id,icCard) {
        this.$confirm('是否确定解绑IC卡:'+icCard+'？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          iCardUntying(id).then(response => {
            if (response.success) {
              this.$message({
                message: '解绑成功',
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
            deleteICCard(this.multipleSelection).then(response => {
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
            message: '请选择需要删除的IC卡',
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
      checkSelectable(row) {
       return row.isBind =='0'
      }
    }
  }
</script>
<style lang="scss">

</style>
