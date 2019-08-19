<template>
  <div class="app-small"  style="background:#fff;">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tab-check" stretch>

      <el-tab-pane label="发信息" name="first">
        <div class="outbox">
          <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px" class="fl left-outbox">
            <el-form-item label="收件人" prop="name">
              <el-select
                ref="select2"
                style="width:100%"
                v-model="value"
                multiple
                filterable
                remote
                allow-create
                default-first-option
                placeholder="请输入收件人"
                :remote-method="remoteMethod"
                @change="changeMethod"
                :loading="loading">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value" >
                </el-option>
              </el-select>
              <!-- <el-popover
                  placement="bottom-start"
                  trigger="focus"
                  >
                  <ul class="inboxPeopleList">
                      <li @click="searchGroupCheck(index)" v-for="(item,index) in contractList">{{item.name}}<{{item.contractNum}}></li>
                  </ul>
                <el-input v-model="formData.name" @input="changeNameList" slot="reference"></el-input>
              </el-popover> -->
            </el-form-item>
            <el-form-item label="短信内容">
              <div class="mes">
                <div class="mes-header">
                  <span class="triangle" :class="triangle" @click="triangleClick"><div class="fl">常用模板</div><i></i></span>
                  <span class="fl" style="color:#b3b3b3">|</span>
                  <span class="fl addLocation" @click="addLocation"><i></i>添加位置</span>
                </div>
                <div class="mes-content">
                  <GeminiScrollbar :style="{maxHeight:modelMaxHeight}" v-if="selectModel" class="selectModel">
                      <ul style="padding-right:8px">
                        <li @click="selectCheck(index)" v-for="(item,index) in selectList" >{{item.name}}</li>
                      </ul>
                  </GeminiScrollbar>
                  <textarea
                    class="outbox-content"
                    v-model="outboxContent"
                    @input="descInput"
                    @click="outboxClick"
                    id="textarea"
                    :style="{height:textareaHeight}"
                    >
                  </textarea>
                  <div class="mes-tip">
                    已经输入 <i>{{outboxLength}}</i> 字节。 （* 短报文电文单条长度仅限 77 字节）
                  </div>

                </div>
              </div>
            </el-form-item>
          </el-form>
          <div class="fr tel-tree" :style="{height:treeHeight}">
            <h3>通讯录<i @click="toMailList" v-if="hasAuth('message:mailList')"></i></h3>
            <div class="tree-search">
              <el-input
                clearable
                placeholder="查找联系人"
                v-model="filterText">
              </el-input>
            </div>
            <div :style="{maxHeight:contractHeight}" style="width:265px;overflow-y: auto;">
              <el-tree
                class="filter-tree"
                :data="contractData"
                node-key="id"
                :default-checked-keys="treeValue"
                :default-expanded-keys='checkedKeys'
                :props="defaultProps"
                default-expand-all
                show-checkbox
                :filter-node-method="filterNode"
                @check="handleCheckChange"
                ref="tree2">
              </el-tree>
            </div>
            
          </div>
        </div>
        <div class="mes-footer">
          <el-button type="primary" size="small" @click="gotoBox" v-if="hasAuth('send')">发送</el-button>
          <el-button style="border:1px solid #2975e6;color:#2975e6;background:none;" size="small" plain @click="draft" v-if="hasAuth('addMsgDraft')">存草稿</el-button>
          <el-button style="border:1;color:#545454;background:#E1E5EC;" size="small" @click="cancelBox" v-show="returnShow">取消</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="模板管理" name="second">
        <table-operate style="margin-top:-10px;">
          <el-button type="primary" size="small"  @click="mouldAdd" v-if="hasAuth('addMould')">添加</el-button>
          <el-button type="danger" size="small"  @click="mouldRemove" v-if="hasAuth('deleteMould')">删除</el-button>
        </table-operate>
        <table-search>
          <el-form :inline="true" :model="listQuery" class="demo-form-inline">
            <el-form-item label="消息类别">
              <el-select v-model="listQuery.templateType" placeholder="请选择模板类别" >
                <el-option label="全部" value=""></el-option>
                <el-option v-for="item in templateTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="消息内容">
              <el-input v-model="listQuery.keyWord" clearable placeholder="消息内容" @keyup.enter.native="doneSubmit"/>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="doneSubmit">查询</el-button>
            </el-form-item>
          </el-form>
        </table-search>

        <div class="app-container">
          <el-table :data="list" :height="tableHeight" v-loading.body="listLoading" element-loading-text="拼命加载中" @selection-change="handleSelectionChange"  border fit stripe >
            <el-table-column type="selection" width="60" align="center"/>
            <el-table-column prop="templateType" label="消息类别" >
              <template slot-scope="scope">
                <div v-for="item in templateTypeList" v-if="scope.row.templateType==item.value">{{item.name}}</div>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="消息内容"/>
            <el-table-column prop="createTime" label="创建时间" >
              <template slot-scope="scope">
                <div>{{scope.row.createTime | formatDate}}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="180">
              <template slot-scope="scope">
                <el-button size="medium" style="color:#4687BE" type="text"  @click="edit(scope.row.id)" v-if="hasAuth('mouldEdit')">编辑</el-button>
                <el-button size="medium" style="color:#F78989" type="text" @click="remove(scope.row.id)" v-if="hasAuth('deleteMould')">删除</el-button>
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
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      :title="mouldDialog.title"
      :visible.sync="mouldDialog.show"
      width="540px">
      <el-row class="mouldDialog">
        <el-form :model="mouldFormData" :rules="rules" ref="mouldForm" label-width="100px">
          <el-form-item label="模板类别" prop="templateType">
            <el-select v-model="mouldFormData.templateType" placeholder="请选择模板类别" style="width:100%">
              <el-option v-for="item in templateTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="模板内容" prop="content">
            <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入模板内容"
              class="outbox-content"
              v-model="mouldFormData.content"
              @input="descInput"
              id="mouldTextarea"
              >
            </el-input>
            <div class="mes-tip">已经输入 <i>{{mouldTextLength}}</i> 字节。 （* 短报文电文单条长度仅限 77 字节） </div>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('mouldForm')">保存</el-button>
        <el-button @click="resetForm('mouldForm')">取消</el-button>
      </span>
    </el-dialog>


    <div class="map-mb" :hidden='mapShow'></div>
    <div class="map-dialog" :hidden='mapShow'>
      <h3 class="header">{{userDialog.title}}</h3>
      <div class="tipinput"><el-input id="tipinput" v-model="input" placeholder="搜索地址"></el-input></div>
      <div id="container" style="width:520px;height:200px;"></div>
      <div class="addr-error" v-show="addrShow">未找到相关地址！</div>
      <GeminiScrollbar style="max-height:450px" v-show="!addrShow && resultList.length!=0" class="addr-list">
        <ul id="result">
          <li @click="mapListCheck(index)" v-for="(item,index) in resultList">
            <h4>{{item.name}} </h4>
            <span>{{item.address}} </span>
            <img src="../../assets/images/check2.png" class="check" :hidden="item.hidden"/>
          </li>
        </ul>
      </GeminiScrollbar>
      <span class="footer">
        <el-button type="primary" size="small" @click="addPosition">添加</el-button>
        <el-button size="small" @click="cancelPosition">取消</el-button>
      </span>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { formatDate } from '@/api/date'
  import TableOperate from '@/components/Table/Operate'
  import TableSearch from '@/components/Table/Search'
  import TablePagination from '@/components/Table/PagiContainer'
  import {btnauth} from '@/components/Mixin/btnauth'
  import {templateList,templateAdd,templateSubmit,templateDelete,templateInfo,outboxSend,getContract} from '@/api/outbox'
  import {addMsgDraft} from '@/api/draft'
  import {findListByTreeTogether} from '@/api/mail'
  export default {
    components: {
      TableOperate,
      TableSearch,
      TablePagination
    },
    data() {
      return {
        input:'',
        options: [],
        treeValue:[],
        value: [],
        namesList: [],
        loading: false,
        contractList:[],
        returnShow:false,
        returnUrl:'',
        addrShow:false,
        marker:'',
        map:'',
        mapPosition:'',
        mapShow:true,
        tableHeight:' ',
        contractHeight:'',
        textareaHeight:'',
        modelMaxHeight:'',
        treeHeight:'',
        activeName:'first',
        triangle:'up',
        selectModel:false,
        formData:{
          name:'',
          message:'',
          msgType:'',
          receivedIp:'',
          draftId:'',
          sendPersons:[]
        },
        userDialog:{
          title:'添加位置',
          show:false
        },
        resultList:[],
        poiListLength:"0",
        selectList:[],
        outboxContent:'',
        cursurPosition:'',
        outboxLength:'0',
        outboxNum:'77',
        filterText: '',
        checkedKeys:[],
        addressee:[],
        contractData: [],
        defaultProps: {
          children: 'contractChild',
          label: 'info'
        },
        // 模板
        listQuery: {
          templateType: '',
          keyWord: '',
          pageNo: 1,
          pageSize: 10
        },
        listQuery2: {
          templateType: '',
          keyWord: '',
          pageNo: 1,
          pageSize: 0
        },
        total: 1000,
        allList:[],
        list: null,
        listLoading: false,
        currentPage: 1,
        pagishow: false,
        multipleSelection: [],
        mouldDialog:{
          title:'',
          show:false
        },
        mouldFormData:{
          templateType:'',
          content:'',
          id:''
        },
        templateTypeList:[],
        mouldTextLength:'0',
        rules: {
          templateType: [
            { required: true, message: '请选择模板类别', trigger: 'change' }
          ],
          content: [{ required: true, message: '请输入模板内容', trigger: 'blur'},
          { min: 1, max: 77, message: '最多输入77个字符', trigger: 'blur' }],
        }

      }
    },
    computed: {
      ...mapGetters(['permission_routers']),
    },
    filters: {
      formatDate(time) {
        var date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm');
      }
    },
    created() {
      // this.mapInit()
    },
    mixins: [btnauth],
    mounted() {
      this.map = new AMap.Map("container", {
          resizeEnable: true,
          center: [120.181042,30.257808]
      });
      this.changeNameList();
      this.fetchData2()
      this.findListByTreeTogether()
      this.fetchData()
      let screenHeight=document.documentElement.clientHeight;
      this.textareaHeight = screenHeight-397 +'px';
      this.treeHeight = screenHeight-280 +'px';
      this.tableHeight = screenHeight-375 +'px';
      this.contractHeight=screenHeight-385 +'px';
      this.modelMaxHeight=screenHeight-520 +'px';
      const that = this;
      window.onresize = function temp() {
        that.textareaHeight = `${document.documentElement.clientHeight-397}px`;
        that.modelMaxHeight = `${document.documentElement.clientHeight-520}px`;
        that.treeHeight = `${document.documentElement.clientHeight-280}px`;
        that.contractHeight = `${document.documentElement.clientHeight-385}px`;
        that.tableHeight = `${document.documentElement.clientHeight-375}px`;
      };
      this.templateTypeList=this.$store.state.allDic.allDictionary.msgType.dictionary;
      if(this.$route.query.returnUrl){
        this.returnShow=true
        this.returnUrl=this.$route.query.returnUrl
      }

      if(this.$route.query.sendNum){
        this.value.push(this.$route.query.sendNum)
        this.treeValue.push(this.$route.query.sendNum)
      }
      if(this.$route.query.content){
        this.outboxContent=this.$route.query.content
        this.outboxLength = this.getStrLeng(this.outboxContent);
      }
      if(this.$route.query.draftId){
        this.formData.draftId=this.$route.query.draftId
      }
      if(this.$route.query.receivedIp){
        this.formData.receivedIp=this.$route.query.receivedIp
      }
      if(this.$route.query.receivedIds){
        this.value=this.$route.query.receivedIds.split(';')
      }
      if(this.$route.query.name){
        this.value=this.$route.query.name.split(';')
        this.treeValue==this.$route.query.receivedIds.split(';')
      }
    },
    watch: {
      filterText(val) {
        this.$refs.tree2.filter(val);
      }
    },
    methods: {
       remoteMethod(query) {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.options = this.namesList.filter(item => {
            return item.label.toLowerCase()
              .indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      },
      changeMethod(data){
        // console.log(data[data.length-1].split(" ").join("").length)
        if(data.length>0){
          if(data[data.length-1].split(" ").join("").length==0){
            this.value.splice(data.length-1,data.length)
            // console.log(this.value)
          }
        }
        setTimeout(()=>{ this.$refs.select2.blur(); }, 50);
        this.$refs.tree2.setCheckedKeys(data,true)
      },

      toMailList(){
        this.$router.push({path:"/message/mailList"})
      },
      // 点击收件箱收起常用模板
      outboxClick(){
        this.triangle='up'
        this.selectModel=false
        var myField = document.querySelector("#textarea");
        this.cursurPosition = myField.selectionStart;
      },
      changeNameList(){
        getContract().then(res=>{
          if(res.success){
            this.contractList=res.data
            this.namesList = res.data.map(item => {
              var name=item.name+'<'+item.contractNum+'>'
              return { value: item.id, label: name };
            });
            this.options=this.namesList
          }
        })
      },
      searchGroupCheck(index){
        this.formData.name = this.formData.name.substring(0,this.formData.name.lastIndexOf(';')+1)
        this.formData.name = this.formData.name+this.contractList[index].name+'<'+this.contractList[index].contractNum+'>;'
        this.contractList=[];
      },
      // 输入框输入时计算文字长度
      descInput(){
        this.outboxNum=77-this.getStrLeng(this.outboxContent);
        var myField = document.querySelector("#textarea");
        this.cursurPosition = myField.selectionStart;
        // console.log(this.cursurPosition)
        //console.log(this.getStrLeng(this.outboxContent))
        this.outboxLength=this.getStrLeng(this.outboxContent);
        this.mouldTextLength=this.getStrLeng(this.mouldFormData.content);
      },
      // 发送
      gotoBox(){
        var params={}
        params.draftId=this.formData.draftId
        params.receivedIp=this.formData.receivedIp
        params.receivedInfos=this.formData.name
        params.content=this.outboxContent
        params.sendPersons = this.value
        //console.log(params)
        outboxSend(params).then(res=>{
            if(res.success){
              if(res.data>0){
                this.$message({
                  message: '发送消息已排队群发，前面还有'+res.data+'条消息在等待！',
                  type: 'success'
                })
              }else{
                 this.$message({
                   message: '发送消息已排队群发',
                   type: 'success'
                 })
              }
              this.$router.push({path:'/message/hasSend'})
           }else{
              this.$message({
                message: res.message,
                type: 'error'
              })
           }

        })
      },
      // 存草稿
      draft(){
        var params={}
        params.id=this.formData.draftId
        params.receivedInfo=this.formData.name
        params.content=this.outboxContent
        params.msgType=this.formData.msgType
        params.sendPersons = this.value
        addMsgDraft(params).then(res=>{
           if(res.success){
              this.$message({
                message: res.message,
                type: 'success'
              })
           }

           this.$router.push({path:'/message/draft'})
        })
      },
      // 取消
      cancelBox(){
         this.$router.push({path:this.returnUrl})
      },
      addLocation(){
        this.mapShow=false
        this.mapInit()
      },
      mapInit(){
        var that=this
        that.map.clearMap();
        AMap.plugin('AMap.Geolocation', function() {
            var geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                timeout: 10000,          //超过10秒后停止定位，默认：5s
                buttonPosition:'RB',    //定位按钮的停靠位置
                buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点

            });
            that.map.addControl(geolocation);
            geolocation.getCurrentPosition();
        });
        that.resultList=[]
        this.mapPosition=[]
        var autoOptions = {
            input: "tipinput"
        };
        var auto = new AMap.Autocomplete(autoOptions);
        auto.input.value=''
        var placeSearch = new AMap.PlaceSearch(autoOptions);
        AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
        function select(e) {
            placeSearch.search(e.poi.name, function(status, result) {
              that.resultList=[]
              //console.log(result.poiList.pois);
              if(result.poiList.pois.length!=0){
                that.addrShow=false
                if(result.poiList.pois.length>6){
                  that.poiListLength=6
                }else{
                  that.poiListLength=result.poiList.pois.length
                }
                for(var i=0;i<that.poiListLength;i++){
                  var arr={}
                  arr.hidden=true
                  arr.name=result.poiList.pois[i].name
                  arr.address=result.poiList.pois[i].address
                  arr.location=result.poiList.pois[i].location
                  that.resultList.push(arr)
                }
                // console.log(that.resultList);
              }else{
                that.addrShow=true
                // this.$message({
                //     message: response.message,
                //     type: 'warning'
                // })
              }


            })
        }
      },
      mapListCheck(index){
        for(var i=0;i<this.poiListLength;i++){
          this.resultList[i].hidden=true
        }
        this.resultList[index].hidden=false
        // console.log(this.resultList[index].location.lng,this.resultList[index].location.lat)
        this.mapPosition='(POS:'+this.resultList[index].location.lng+','+this.resultList[index].location.lat+')'
        if(this.marker){
          this.map.remove(this.marker);
        }
        this.marker = new AMap.Marker({
            position: [this.resultList[index].location.lng,this.resultList[index].location.lat],
            offset: new AMap.Pixel(-13, -30)
        });
        this.marker.setMap(this.map);
        this.map.setFitView();
      },
      addPosition(){
        // console.log(this.outboxContent)
        this.mapShow=true
        this.outboxContent =this.outboxContent.substring(0, this.cursurPosition) +
            this.mapPosition +
            this.outboxContent.substring(this.cursurPosition,this.outboxContent.length)
        this.outboxLength = this.getStrLeng(this.outboxContent);
        this.outboxNum=77-this.outboxLength
      },
      cancelPosition(){
        this.mapShow=true
      },
      // 查找通讯录
      filterNode(value, data) {
        if (!value) return true;
        return data.info.indexOf(value) !== -1;
      },
      handleClick(){
        if(this.activeName!='second'){
          this.fetchData2()
        }
      },
      // 常用模板选择
      selectCheck(index){
        //console.log(this.selectList[index].name)
        this.outboxContent =this.selectList[index].name
        this.triangle='up'
        this.selectModel=false
        this.outboxLength = this.getStrLeng(this.outboxContent);
        this.outboxNum=77-this.outboxLength
      },
      triangleClick(){
        if(this.triangle=='up'){
          this.triangle='down'
          this.selectModel=true
        }else{
          this.triangle='up'
          this.selectModel=false
        }

        if(this.selectList.length==0){
          this.triangle='up'
          this.selectModel=false
          this.$confirm('您暂未设置常用模板，可去添加常用模板', '提示', {
                    confirmButtonText: '去设置',
                    cancelButtonText: '取消',
                    type: 'warning'
          }).then(() => {
              this.activeName='second'
          })
        }
      },
      // 通讯录加载
      findListByTreeTogether(){
        findListByTreeTogether().then(response=>{
          this.contractData=response.data
        })
      },
      // tree选中
      handleCheckChange(data, checked) {
        var getChecked=[]
        //console.log(data)
        //console.log(checked)
        if(data.isContract == 1){
          getChecked.push(data)
        }else{
          if(data.contractChild){
            var param = data.contractChild
            var paramLength = data.contractChild.length
            var noList=[]
            for(var j = 0;j<data.contractChild.length;j++){
               var lock  = true
                if(data.contractChild[j].isContract == 1){
                    for(var i = 0; i < this.value.length; i++){
                      if(this.value[i] == data.contractChild[j].id){

                        lock=false;
                        break;
                      }
                    }
                   if(lock){
                      noList.push(data.contractChild[j])
                   }
                }
            }
            if(noList.length>0){
              getChecked.push.apply(getChecked,noList)
            }else{
              getChecked.push.apply(getChecked,data.contractChild)
            }
          }
        }
        for(var j = 0; j < getChecked.length; j++){
           if(getChecked[j].isContract == 1){
              var num =1
              for(var i = 0; i < this.value.length; i++){
                  if(getChecked[j].id == this.value[i]){
                    this.value.splice(i, 1)
                    num=2;
                  }
              }
              if(num===1){
                this.value.push(getChecked[j].id)
              }
           }
        }
      },
      // tab2：模板管理
      fetchData () {
        this.listLoading = true
        templateList(this.listQuery).then(response => {
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
      // 全部模板
      fetchData2 () {
        this.listLoading = true
        this.selectList=[]
        templateList(this.listQuery2).then(response => {
          this.allList=response.data.list;
          for(var i = 0; i < this.allList.length; i++){
            var arr={}
            var name=this.templateTypeList[this.allList[i].templateType-1].name
            arr.name=name+'：'+this.allList[i].content
            this.selectList.push(arr)
          }
        })
      },
      // 查询
      doneSubmit(){
        this.fetchData();
      },
      // 详情
      init(id){
        templateInfo(id).then(response =>{
          this.mouldFormData.id=response.data.id
          this.mouldFormData.templateType = response.data.templateType
          this.mouldFormData.content = response.data.content
          this.mouldTextLength=this.getStrLeng(this.mouldFormData.content);
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
      handleSelectionChange(val) {
        let ids = ''
        val.forEach(element => {
          ids+=element['id']+','
        });
        this.multipleSelection = ids
      },
      mouldAdd(){
        this.mouldTextLength=0;
        this.mouldDialog.title='新增短信模板'
        this.mouldDialog.show=true
      },
      edit(id){
        this.mouldDialog.title='短信模板编辑'
        this.mouldDialog.show=true
        this.init(id)
      },
      remove(id){
        this.$confirm('是否确定删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          templateDelete(id).then(response => {
            if(response.success){
                this.fetchData()
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
          })
        })
      },
      mouldRemove(){
        if (this.multipleSelection.length > 0) {
          this.$confirm('是否确定删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            templateDelete(this.multipleSelection).then(response => {
              if (response.success) {
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
            message: '请选择需要删除的模板',
            type: 'warning'
          })
        }
      },
      submitForm (formName) {
        this.$refs[formName].validate(valid => {
          if(this.getStrLeng(this.mouldFormData.content) >77){
            this.$message({
              message: "短信模板内容过长",
              type: 'warning'
            })
            return false;
          }
          if (valid) {
            if(this.mouldDialog.title=="短信模板编辑"){
              templateSubmit(this.mouldFormData).then(response =>{
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
                this.fetchData();
                this.resetForm(formName);
              })
            }else if(this.mouldDialog.title=="新增短信模板"){
              var params={} ;
              params.templateType = this.mouldFormData.templateType;
              params.content = this.mouldFormData.content;
              templateAdd(params).then(response =>{
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
                this.fetchData();
                this.resetForm(formName);
              })
            }
          } else {
            return false
          }
        })
      },
      resetForm (formName) {
        this.mouldDialog.show=false
        this.$refs[formName].resetFields();
      },
      getStrLeng(str){
          var realLength = 0;
          var len = str.length;
          var charCode = -1;
          for(var i = 0; i < len; i++){
              charCode = str.charCodeAt(i);
              if (charCode >= 0 && charCode <= 128) {
                  realLength += 1;
              }else{
                  // 如果是中文则长度加2
                  realLength += 2;
              }
          }
          return realLength;
      }
    }
  }
</script>
<style lang="scss">
  .inboxPeopleList{
    list-style: none;
    padding: 0;
    margin: 0 auto;
    line-height: 30px;
  }
  textarea{
    resize:none
  }
  .amap-sug-result{
    z-index: 1112;
  }
  .map-mb{
    position: fixed;
    z-index: 1110;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0.5;
  }
  .map-dialog{
    position: fixed;
    z-index: 1111;
    top: 10%;
    left: 50%;
    width: 520px;
    margin-left: -260px;
    border-radius: 4px;
    background-color: #fff;
    .header{
      font-size: 15px;
      color: #282828;
      padding: 0px 20px;
    }
    .tipinput{
      width: 100%;
      height: 50px;
      padding: 10px 20px;
      background: #F1F3F5;
      input{
        border: 0;
        height: 30px;
        text-align: center;
      }
    }
    .addr-error{
      height: 150px;
      text-align: center;
      line-height: 150px;
      font-size: 16px;
    }
    .addr-list{
      height: 150px;
      list-style: none;
      padding: 0;
      margin: 0;
      /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
      ::-webkit-scrollbar{
        width: 6px;
        height: 6px;
        background-color: #F5F5F5;
      }
      /*定义滑块 内阴影+圆角*/
      ::-webkit-scrollbar-thumb{
          border-radius: 10px;
          -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.2);
          background-color: rgba(0,0,0,0.2);
      }
      .gm-scroll-view{
        min-width: 520px;
        min-height: 167px;
      }
      ul li{
        position: relative;
        border-bottom: 1px solid #F1F3F5;
        padding:9px 20px;
        list-style-type:none;
        margin-left:-40px;
        h4{
          margin: 0;
          font-size: 15px;
          color: #282828;
        }
        span{
          font-size: 12px;
          color: #999999;

        }
        .check{
          width: 18px;
          height: 18px;
          position: absolute;
          z-index: 2;
          right: 20px;
          top: 20px;
        }
      }
    }
    .footer{
      background-color: #F1F3F5;
      height: 60px;
      padding-top: 20px;
      text-align: center;
      display: block;

    }
  }
  .fl{
    float: left;
  }
  .fr{
    float: right;
  }
  .tab-check{
    background-color: #fff;
    position: relative;
    .el-tabs__nav-scroll,.el-tabs__nav{
      width: 260px;
    }
    .el-tabs__item{
      font-size: 15px;
      width: 130px;
      height: 50px;
      line-height: 50px;
      text-align: center;
    }
    .el-tabs__active-bar{
      // width: 100px!important;
      color: #2975E6;
      background-color: #2975E6;
    }

    .outbox{
      overflow: hidden;
      .left-outbox{
        width:  calc(100% - 285px);
      }
      .tel-tree{
        width: 250px;
        min-height: 200px;
        border: 1px solid #dcdfe6;
        margin-right: 20px;
        border-radius: 4px;
        overflow: hidden;
        h3{
          text-align: center;
          font-size: 14px;
          font-weight: normal;
          position: relative;
          i{
            position: absolute;
            z-index: 3;
            right: 10px;
            top: -3px;
            cursor: pointer;
            width: 20px;
            height: 19px;
            background: url("../../assets/images/mailAdd.png") no-repeat;
            background-size: 100%;

          }
        }
        .tree-search{
          background: #EBEEF1;
          padding: 8px 10px;
          input{
            width: 100%;
            height: 30px;
            border: 0;
            line-height: 30px;
            text-align: center;
          }
        }
      }

    }


    .mes-footer{
      background-color: #F1F3F5;
      height: 61px;
      padding-left: 100px;
      button{
        margin-top: 15px;
      }
    }
  }

  .mes{
    background: #fff;
    border-radius:4px;
    border: 1px solid #dcdfe6;
    .mes-header{
      overflow: hidden;
      background: #F1F3F5;
      height: 40px;
      /*向上*/
      .triangle{
        float: left;
        padding: 0 20px;
        overflow: hidden;
        cursor: pointer;
      }
      .triangle i{
          margin-left: 6px;
          margin-top: 18px;
          float: left;
          width: 0;
          height: 0;
          border-width: 5px;
          border-style: solid;
      }
      .down i{
        border-color:#282828 transparent transparent transparent;
      }
      .up i{
        margin-top: 13px;
        border-color:transparent transparent #282828 transparent;
      }

      .addLocation{
        cursor: pointer;
        margin-left: 20px;
        padding-left: 13px;
        background: url("../../assets/images/location-icon.png") no-repeat 0 14px;
      }
    }

    .mes-content{
      position: relative;
      .outbox-content{
        width: 100%;
        border: 0;
        font-size: 14px;
        line-height: 30px;
        height: 340px;
        padding: 10px 20px 20px 20px;
      }
      .outbox-content:focus{
        border: 0;
        outline:none;
      }
      .selectModel{
        width: 100%;
        margin: 0;
        padding:0;
        list-style: none;
        border-bottom: 1px solid #dcdfe6;
        position: absolute;
        z-index: 10;
        top: 0;
        left: 0;
        li{
          height: 45px;
          line-height: 45px;
          padding-left: 20px;
          margin-left:-40px;
          cursor: pointer;
          background: #fff;
          list-style-type:none;
        }
        li:hover{
          background-color: #2975E6;
          color: #fff;
        }
      }

      .mes-tip{
        width: calc(100%-10px);
        background: #fff;
        position: absolute;
        z-index: 10;
        bottom: 0px;
        left: 0;
        padding-left: 20px;
        i{
          color: #2975E6;
          font-style: normal;
        }
      }
    }


  }

  .mouldDialog{
    .mes-tip{
      position: absolute;
      z-index: 10;
      bottom: 1px;
      left: 1px;
      padding-left: 10px;
      background: #fff;
      border-radius: 3px;
      i{
        color: #2975E6;
        font-style: normal;
      }
    }
    .outbox-content{
      textarea{
        width: 100%;
        font-size: 14px;
        line-height: 30px;
        height: 220px;
        padding-bottom: 50px;
      }

    }
    .outbox-content:focus{
      outline:none;
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

    .el-popper{
        padding: 0;
    }
  }

</style>
