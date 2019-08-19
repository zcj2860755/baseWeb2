<template>
  <div class="app-small">
    <div class="listTotal">紧急SOS（共{{total}}条）</div>
    <table-operate >
      <el-button type="danger" size="small" v-if="hasAuth('sosDelete')" @click="batchRemove">删除</el-button>
      <el-button type="primary" size="small" @click="read">标记已读</el-button>
    </table-operate>
    <table-search>
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.keyWord" clearable placeholder="卡号/消息内容" @keyup.enter.native="doneSubmit"/>
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
        <el-table-column prop="isRead" label="状态" width="60">
            <template slot-scope="scope">
              <div v-if="scope.row.isRead  == 1" style="text-align: center;">
                 <img src="../../assets/images/emailopen.png"/>
             </div>
             <div v-else="scope.row.isRead  == 0" style="text-align: center;">
                 <img src="../../assets/images/email.png"/>
             </div>
           </template>
        </el-table-column>
        <el-table-column prop="sendName" label="发送者" min-width="50">
          <template slot-scope="scope">
            {{scope.row.sendName}}<{{scope.row.sendNum}}>
          </template>
        </el-table-column>
        <!--<el-table-column prop="receivedName" label="接收人" min-width="50"/>-->
        <!--<el-table-column prop="content" label="消息类型" min-width="50"/>-->
        <el-table-column prop="content" label="消息内容" min-width="160">
          <template slot-scope="scope">
             <div v-if="scope.row.isRead  == 0">
                 <el-button type="text"  style="color:#000000" @click="msgDetail(scope.row.id,scope.row.sendName,scope.row.receivedName,scope.row.content)"><strong>{{scope.row.content}}</strong></el-button>
             </div>
             <div v-else="scope.row.isRead  == 1">
                 <div>{{scope.row.content}}</div>
             </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发送时间" min-width="100" :formatter="dateFormat"/>
        <el-table-column prop="address" label="发送地址" min-width="80"/>
        <el-table-column prop="status" label="处理状态" min-width="50">
         <template slot-scope="scope">
           <div v-if="scope.row.receivedStatus  == 1">
               <div style="color:#00CC33">已收到</div>
           </div>
           <div v-else="scope.row.receivedStatus == '0'">
               <div style="color:#FF3366">未收到</div>
           </div>
         </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button size="medium" style="color:#4687BE" type="text" v-if="hasAuth('sosReplyTo') && hasAuth('message:outbox')" @click="replyTo(scope.row.content)">转发</el-button>
            <el-button size="medium" style="color:#4687BE" type="text" v-if="hasAuth('sosReply') && hasAuth('message:outbox')" @click="reply(scope.row.sendName,scope.row.sendNum)">回复</el-button>
            <el-button size="medium" style="color:#F78989" type="text" v-if="hasAuth('sosDelete')" @click="remove(scope.row.id)">删除</el-button>
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
          <el-form :model="messageInfo" ref="userForm" label-width="100px">
            <el-form-item label="发件人">
              <el-input v-model="messageInfo.sendPerson" :disabled="disabled"></el-input>
            </el-form-item>
            <!--<el-form-item label="收件人">
              <el-input v-model="messageInfo.receivedPerson" :disabled="disabled"></el-input>
            </el-form-item>-->
            <el-form-item label="短信内容">
              <el-input type="textarea" v-model="messageInfo.content" :disabled="disabled" :rows="5"></el-input>
            </el-form-item>
          </el-form>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="resetForm()">确定</el-button>
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
  import {inboxList, inboxInfo, inboxDelete,inboxRead} from '@/api/inbox'
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
          keyWord: '',
          beginTime:'',
          endTime:'',
          sosFlag:'1',
          id: '',
          pageNo: 1,
          pageSize: 10
        },
        disabled:true,
        // 详情弹框
        userDialog: {
          show:false,
          title:''
        },
        messageInfo:{
          content:'',
          sendPerson:'',
          receivedPerson:''
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
          inboxList(this.listQuery).then(response => {
            this.list = response.data.list
            this.total = response.data.totalCount
            this.listLoading = false
            if (this.total > 0) {
              this.pagishow = true
            }
          })
        }

      },
      reply(data,sendNum) {
       this.$router.push({path:'/message/outbox', query: {sendNum: sendNum,returnUrl:'/sos/sosInbox'}})
      },
      replyTo(data) {
       this.$router.push({path:'/message/outbox', query: {content: data,returnUrl:'/sos/sosInbox'}})
      },
      remove(id) {
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          inboxDelete(id).then(response => {
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
            inboxDelete(this.multipleSelection).then(response => {
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
            message: '请选择需要删除的短信',
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
      msgDetail(id,sendPerson,receivedPerson,content){
        this.readById(id)
        this.fetchData()
        this.userDialog.title="短信详情";
        this.userDialog.show = true;
        this.messageInfo.sendPerson=sendPerson
        this.messageInfo.receivedPerson=receivedPerson
        this.messageInfo.content=content
      },
      read() {
        if (this.multipleSelection.length > 0) {
          this.$confirm('是否确定已读？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            inboxRead(this.multipleSelection).then(response => {
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
        }else{
            this.$message({
              message: '请选择需要标记已读的短信',
              type: 'warning'
            })
        }
      },
      readById(id) {
        inboxRead(id).then(response => {
        })
      },
      resetForm () {
        this.userDialog.show=false
      }
    }
  }
</script>
<style lang="scss">

</style>
