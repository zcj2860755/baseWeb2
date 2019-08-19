<template>
  <div class="app-small">
    <table-operate >
      <el-button type="primary" size="small"  v-if="hasAuth('deviceAdd')" @click="gotoform">添加</el-button>
      <el-button type="danger" size="small" v-if="hasAuth('deviceDelete')" @click="batchRemove">删除</el-button>
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
          <el-input v-model="listQuery.searchContent" clearable @focus="inputfocus('account')" style="width:300px;" @blur="inputblur('account')" placeholder="请输入设备名称/姓名/IC卡号/手机号" @keyup.enter.native="doneSubmit"/>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="listQuery.deviceType" placeholder="请选择设备类型" style="width:100%">
               <el-option label="全部" value=""></el-option>
              <el-option v-for="item in deviceTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
        <el-table-column type="selection" min-width="40" align="center"/>
        <el-table-column prop="groupName" label="所属分组" min-width="150"/>
        <el-table-column prop="deviceName" label="设备名称" min-width="100"/>
        <el-table-column prop="deviceType" label="设备类型" min-width="90">
          <template slot-scope="scope">
            <div v-for="item in deviceTypeList" v-if="scope.row.deviceType==item.value">{{item.name}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="deviceModel" label="设备型号" min-width="120"/>
        <el-table-column prop="belongName" label="姓名/单位" min-width="100"/>
        <el-table-column prop="icCard" label="ic卡号" min-width="120" />
        <el-table-column prop="tel" label="联系号码" min-width="120" />
        <el-table-column prop="address" label="地址" min-width="180" />
        <el-table-column label="操作" align="center" width="95">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" type="text" v-if="hasAuth('deviceEdit')"  @click="edit(scope.row.id)">编辑</el-button>
            <el-button size="medium" style="color:#F78989" type="text" v-if="hasAuth('deviceDelete')"  @click="remove(scope.row.id,scope.row.icCard)">删除</el-button>
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
  import {groupSelect,groupSelectEdit} from '@/api/group'
  import {getDeviceList,deleteDevice} from '@/api/device'
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
          pageSize: 10,
          groupId:''
        },
        i:'1',
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
        deviceTypeList:[],
        groupProps:{
          value : "id",
          label : "name",
          children: 'childTSysGroup'
        },
        relativeLevel:0,
        LevelAll:0,
        level: '',
        cityindex: '',
        countyindex: '',
        blockindex:'',
        unitindex:'',
        response: [],
        rules: {

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
      this.tableHeight = screenHeight-305 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-305}px`;
      };
      this.groupChange('')
      this.deviceTypeList=this.$store.state.allDic.allDictionary.deviceType.dictionary;
    },
    methods: {
      //时间格式化
      dateFormat(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
      },
      groupChange(id){
        groupSelect(id).then(response => {
          if(response.data.length>0){
          if(this.i==1){
            this.relativeLevel = response.data[0].grade-1;
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
      },
      gotoform() {
        this.$router.push({path:"/card/deviceList/deviceAdd"})
      },
      doneSubmit() {
        this.fetchData()
      },
      fetchData() {
        this.listLoading = true
        this.listQuery.id=this.listGroupId[this.listGroupId.length-1]

        this.listQuery.beginTime='';
        this.listQuery.endTime=''
        if(this.listQuery.rangeTime){
          this.listQuery.beginTime=this.listQuery.rangeTime[0];
          this.listQuery.endTime=this.listQuery.rangeTime[1];
        }

        getDeviceList(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.totalCount
          this.listLoading = false
          if (this.total > 0) {
            this.pagishow = true
          }
        })
      },
      edit: function (id) {
        this.init(id)
      },
      remove: function (id,icCard) {
        var msg = ''
        if(icCard){
          msg='是否确定与IC卡:'+icCard+'解除绑定，并将终端设备删除？'
        }else{
          msg='是否确定删除？'
        }
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteDevice(id).then(response => {
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
            deleteDevice(this.multipleSelection).then(response => {
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
      //详情
      init: function (id) {
        this.$router.push({path:"/card/deviceList/deviceEdit",query: {id: id}})
      }
    }
  }
</script>
<style lang="scss">

</style>
