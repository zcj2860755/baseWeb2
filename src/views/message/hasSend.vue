<template>
  <div class="app-small">
    <div class="listTotal">已发送（共{{total}}条）</div>
    <table-operate v-if="hasAuth('hasSendDelete')">
      <el-button type="danger" size="small" v-if="hasAuth('hasSendDelete')" @click="batchRemove">删除</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
          <el-form-item label="关键字">
            <el-input v-model="listQuery.keyword" clearable @focus="inputfocus('account')" @blur="inputblur('account')" placeholder="请输入收件人/消息内容" @keyup.enter.native="doneSubmit"/>
          </el-form-item>
          <el-form-item label="发送时间">
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
          <el-form-item>
            <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
          </el-form-item>
      </el-form>
    </table-search>
    <div class="app-container">
      <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe style="with:100%">
        <el-table-column type="selection" width="60" align="center"/>
        <!--<el-table-column prop="sendStatus" label="状态" width="160"/>-->
        <el-table-column label="收件人" min-width="120">
          <template slot-scope="scope">
            <div v-if="scope.row.receivedName  != null && scope.row.receivedName  != ''">
                <div>{{scope.row.receivedName}}<{{scope.row.receivedNum}}></div>
            </div>
            <div v-else="status == 'fail'">
                <div>{{scope.row.receivedNum}}</div>
            </div>
          </template>
         </el-table-column>
        <!--<el-table-column  min-width="180" label="消息类别">
          <template slot-scope="scope">
            <div v-for="item in selectList" v-if="scope.row.msgType == item.dicValue">{{item.dicKey}}</div>
          </template>
        </el-table-column>-->
        <el-table-column prop="content" label="消息内容" min-width="180"/>
        <el-table-column prop="createTime" label="发送时间" min-width="80" :formatter="dateFormat"/>
        <el-table-column prop="sendStatus" label="发送状态" min-width="40">
          <template slot-scope="scope">
            <div v-if="scope.row.sendStatus  == 2">
                <div style="color:#00CC33">发送成功</div>
            </div>
            <div v-else-if="scope.row.sendStatus == '1'">
                <div style="color:#CCCC00">发送中</div>
            </div>
            <div v-else="scope.row.sendStatus == '3'">
                <div style="color:#FF3366">发送失败</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="100">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#E6A23C" type="text" v-if="hasAuth('hasSendReplyAgain') && hasAuth('message:outbox')" @click="replyAgain(scope.row.receivedName,scope.row.receivedNum,scope.row.content)">再次编辑</el-button>
            <el-button size="medium" style="color:#4687BE" type="text" v-if="hasAuth('hasSendReplyTo') && hasAuth('message:outbox')" @click="replyTo(scope.row.content)">转发</el-button>
            <el-button size="medium" style="color:#F78989" type="text" v-if="hasAuth('hasSendDelete')" @click="deleteSendMsg(scope.row.id)">删除</el-button>
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
  import {dictionaryListDicByParent} from '@/api/dataDar'
  import {getSendMsgList,deleteSendMsg} from '@/api/hasSend'
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import {mapGetters} from 'vuex'
  import {btnauth} from '@/components/Mixin/btnauth'
  import { placeholderie } from '@/components/Mixin/placeholderie'
  import { isvalidPhone, validateNumberAndEnglish } from '@/utils/validate'
  import { fixie9input } from '@/components/Mixin/fixie9input'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        oldVue:'',
        deviceCodesOptions:[],
        tableHeight:' ',
        listQuery: {
          keyword: '',
          beginTime: '',
          endTime: '',
          pageNo: 1,
          pageSize: 10
        },
        deviceModelStatus:[],
        deviceTypeStatus:[],
        total: 1000,
        list: null,
        devicelist:null,
        listLoading: true,
        deviceLoading: true,
        currentPage: 1,
        pagishow: false,
        multipleSelection: [],
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        deviceDialog: {
          show:false,
          title:''
        },
        isEdit:false,
        selectList:[],
        selectName:'',
        sexSelectList:[],
        orgs:[],
        roles:[],
        props : {
          value : "id",
          label : "orgName",
        },
        parentIds: [],
        formData: {
          accountId:'',
          account: '',
          password: '',
          realName: '',
          status: '',
          orgId:'',
          orgs:[],
          roleId:'',
          roles:[],
          tel: '',
          deviceIds:[]
        },
        ieForm:{
          pass: '',
          password: '',
          realName: '',
          tel: '',
          email: ''
        }
         }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    mixins: [btnauth,placeholderie,fixie9input],
    created() {
      this.fetchData();
      this.dictionaryListDicByParent('msgType')
      //this.selectList=this.$store.state.allDic.allDictionary.msgType.dictionary;
      //this.selectName=this.$store.state.allDic.allDictionary.accountStatus.name
    },
    mounted() {
      let screenHeight=document.documentElement.clientHeight;
      this.tableHeight = screenHeight-352 +'px';
      const that = this;
      window.onresize = function temp() {
        that.tableHeight = `${document.documentElement.clientHeight-352}px`;
      };

      if(this.$route.query.beginTime){
        this.listQuery.beginTime=this.$route.query.beginTime
      }
      if(this.$route.query.endTime){
        this.listQuery.endTime=this.$route.query.endTime
      }

      this.fetchData()
    },
    methods: {
      forbiddenAutoFill(val,name){
        var isSupportPlaceholder = 'placeholder' in document.createElement('input')
        if(!isSupportPlaceholder){
          this.ieForm[name] = val
        }
      },
      //时间格式化
      dateFormat(row, column) {
        let date = row[column.property];
        return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
      },
      doneSubmit: function () {
        this.fetchData()
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
          getSendMsgList(this.listQuery).then(response => {
            this.list = response.data.list
            this.total = response.data.totalCount
            this.listLoading = false
            if (this.total > 0) {
              this.pagishow = true
            }
          })
        }
      },
      replyAgain(name,num,content) {
        var name=name+'<'+num+'>'
       this.$router.push({path:'/message/outbox', query: {content: content,name:name,returnUrl:'/message/hasSend'}})
      },
      replyTo(data) {
       this.$router.push({path:'/message/outbox', query: {content: data,returnUrl:'/message/hasSend'}})
      },
      remove: function (id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteSendMsg(id).then(response => {
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
      unBindDevice: function (userId,id,deviceCode) {
        this.$confirm('设备号'+deviceCode+'是否解除绑定？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          submitDeviceEdit({"id":id,"accountId":''}).then(response => {
            this.deviceInit(userId)
            //this.fetchData()
          })
        })
      },
      deleteSendMsg:function(msgDraftId) {
          this.$confirm('是否确定删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteSendMsg(msgDraftId).then(response => {
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
          this.$confirm('确定要删除已选中消息？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteSendMsg(this.multipleSelection).then(response => {
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
            message: '请选择需要删除的消息',
            type: 'warning'
          })
        }
      },
      dictionaryListDicByParent (id) {
        dictionaryListDicByParent({"parentKey":id}).then(response =>{
            this.selectList=response.data;
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
      }
    }
  }
</script>
<style lang="scss">


</style>
