<template>
  <div class="app-small" style="background:#fff;">
    <el-row :style="{height:rowHeight}" style="overflow-y: auto;">
      <el-col :span="23" :offset="1">
        <el-form :model="formData" :rules="rules" ref="userForm" label-width="180px">
          <el-col :span="22" style="margin-top:50px;">
            <el-form-item label="分组" prop="groupId">
              <el-cascader
                separator=">"
                clearable
                change-on-select
                @change="handleItemChange2"
                :options="listGroups"
                :props="groupProps"
                v-model="groupIds"
                style="width:100%"
                ref="cascader2">
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="姓名/单位" prop="belongName">
              <el-input v-model="formData.belongName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="主卡卡号" prop="centerIcCode">
              <el-input v-model="formData.centerIcCode"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="IC卡号" prop="icCode">
              <el-input v-model="formData.icCode"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="手机号码" prop="tel">
              <el-input v-model="formData.tel"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="联系地址" prop="areaId">
              <el-cascader
              separator=">"
              clearable
              change-on-select
              @change="handleAreaChange2"
              :options="areaList"
              :props="areaProps"
              v-model="areaIds"
              style="width:100%"
              ref="cascader3">
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="详细地址" prop="address" placeholder="请输入详细地址">
              <el-input v-model="formData.address" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="套餐" prop="serviceType">
              <template slot-scope="scope">
                <el-select v-model="formData.serviceType" placeholder="请选择套餐类型" style="width:100%">
                  <el-option v-for="item in serviceTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="到期时间" prop="endTime">
              <el-date-picker
                clearable
                v-model="formData.endTime"
                type="date"
                placeholder="到期日期"
                value-format="timestamp">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="认证资料" prop="authType">
              <el-radio v-model="formData.authType" :label="1" @change='changeShow()'>个人</el-radio>
              <el-radio v-model="formData.authType" :label="2" @change='changeShow()'>单位</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="身份证号码" v-if="personalShow" prop="idcard">
              <el-input v-model="formData.idcard" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="身份证正面" v-if="personalShow" prop="idcardFrontPic">
              <el-upload
                ref="idcardFrontPic"
                :class="{disabled:idcardFrontDisabled}"
                :action="getUploadImageUrl()"
                accept="image/png,image/bmp,image/jpg,image/jpeg"
                list-type="picture-card"
                :limit="1"
                :auto-upload="true"
                :on-exceed="handleExceed"
                :before-upload="handleBeforeUpload"
                :on-preview="handlePictureCardPreview"
                :on-success="handleIdcardFrontPicSuccess"
                :on-remove="idcardFrontPicRemove"
                :file-list="idcardFrontFileList">
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>

            <el-form-item label="身份证反面" v-if="personalShow" prop="idcardReversePic">
              <el-upload
                ref="idcardReversePic"
                :class="{disabled:idcardReverseDisabled}"
                :action="getUploadImageUrl()"
                accept="image/png,image/bmp,image/jpg,image/jpeg"
                list-type="picture-card"
                :limit="1"
                :auto-upload="true"
                :on-exceed="handleExceed"
                :before-upload="handleBeforeUpload"
                :on-preview="handlePictureCardPreview"
                :on-success="handleIdcardReversePicSuccess"
                :on-remove="idcardReversePicRemove"
                :file-list="idcardReverseFileList">
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="法人代表" v-if="companyShow" prop="legalBoss">
              <el-input v-model="formData.legalBoss" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="组织机构代码证号" v-if="companyShow" prop="orgCertCode">
              <el-input v-model="formData.orgCertCode" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="营业执照" v-if="companyShow" prop="businessPic">
              <el-upload
                ref="businessPic"
                :class="{disabled:businessFileDisabled}"
                :action="getUploadImageUrl()"
                accept="image/png,image/bmp,image/jpg,image/jpeg"
                list-type="picture-card"
                :limit="1"
                :auto-upload="true"
                :on-exceed="handleExceed"
                :before-upload="handleBeforeUpload"
                :on-preview="handlePictureCardPreview"
                :on-success="handleBusinessPicSuccess"
                :on-remove="businessPicRemove"
                :file-list="businessFileList">
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="22" style="text-align: center;padding:40px 0;">
              <el-button type="primary" @click="submitForm('userForm')">保存</el-button>
              <el-button @click="resetForm('userForm')">取消</el-button>
          </el-col>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { isvalidPhone,validateNumberAndEnglish,isICCard,validateNumber,isChinese,validateNumberAndEnglishAndChinese } from '@/utils/validate'
import {addCardList,getICCardInfo,editCardList} from '@/api/icard'
import URLConfig from '@/config'
import { fixie9input } from '@/components/Mixin/fixie9input'
import {groupSelect, groupSelectEdit, groupList} from '@/api/group'
import {areaSelect, areaSelectEdit} from '@/api/area'
import Group from '@/components/Group/index'
export default {
  components: { Group },
  data () {
     var validateAccount = (rule, value, callback) => {
        if(!validateNumberAndEnglish(value)&&value!=''){
          callback(new Error('请输入数字或英文!'))
        }else{
          callback()
        }
     }
     var validPhone=(rule, value,callback)=>{
       if (value&&!isvalidPhone(value)){
         callback(new Error('请输入正确的11位手机号码'))
       }else {
           callback()
       }
     }
     var validICCard=(rule, value,callback)=>{
        if (value&&!isICCard(value)){
          callback(new Error('请输入正确的身份证号'))
        }else {
            callback()
        }
      }

     var validNumOrEnglishOrChinese=(rule, value,callback)=>{
       if (value&&!(validateNumberAndEnglishAndChinese(value))){
         callback(new Error('请输入数字，英文或中文'))
       }else {
           callback()
       }
     }

     var validNumber=(rule, value,callback)=>{
       if (value&&!validateNumber(value)){
         callback(new Error('请输入数字'))
       }else {
           callback()
       }
     }

    return {
      i:0,
      z:0,
      rowHeight:'',
      personalShow:true,
      companyShow:false,
      isEdit: false,
      flag: false,
      btnMsg: '立即创建',
      orgs:[],
      roles:[],
      nowgroups:[],
      serviceTypeList:[],
      listGroupId:[],
      listGroups:[],
      areaList:[],
      groups:[],
      groupIds:[],
      areaIds:[],
      response: [],
      areaResponse:[],
      businessFileList:[],
      idcardReverseFileList:[],
      idcardFrontFileList:[],
      dialogVisible:false,
      level: '',
      arealevel:'',
      relativeLevel:'0',
      levelAll:'0',
      dialogImageUrl:'',
      groupProps:{
        value : "id",
        label : "name",
        children: 'childTSysGroup'
      },
      areaProps:{
        value : "id",
        label : "name",
        children: 'childTSysArea'
      },
      stats:[
        {
        "statusId": 1,
        "statusName": "启用"
        }, {
        "statusId": 0,
        "statusName": "停用"
        }
      ],
      formData: {
        id:'',
        groupId:'',
        belongName:'',
        centerIcCode: '',
        icCode:'',
        tel:'',
        areaId:'',
        address:'',
        serviceType:'',
        endTime:'',
        authType:'',
        idcard:'',
        idcardFrontPic:'',
        idcardReversePic:'',
        legalBoss:'',
        orgCertCode:'',
        businessPic:''
      },
      ieForm:{
        pass: '',
        password: '',
        realName: '',
        tel: '',
        email: ''
      },
      rules: {
        groupId: [
          { required: true, message: '请输入分组', trigger: 'change' }
        ],
        belongName: [
          { required: true,min:1, max:80, message: '请输入1~80位姓名/单位', trigger: 'blur' },
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' }
        ],
        centerIcCode: [
          { validator:validNumber,trigger: 'blur'},
          { min:4, max:11, message: '请输入4~11位主卡卡号', trigger: 'blur'},
        ],
        icCode: [
          { validator:validNumber,trigger: 'blur'},
          { required: true,min:4, max:11, message: '请输入4~11位IC卡号', trigger: 'blur' },
        ],
        tel: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator:validPhone, trigger: 'blur' }
        ],
        address: [
          { required: true,min:4,max:50, message: '请输入4~50位联系地址', trigger: 'blur' },
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' }
        ],
        serviceType: [
          { required: true, message: '请选择套餐类型', trigger: 'change' }
        ],
        areaId: [
          { required: true, message: '请输入联系地址', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择到期时间', trigger: 'blur' }
        ],
        dicValue: [
          { message: '请输入字典value', trigger: 'blur' },
          {validator: validateAccount, trigger: 'blur' }
        ],
        idcard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { validator:validICCard, trigger: 'blur' }
        ],
        idcardFrontPic: [
          { required: true, message: '请上传身份证正面', trigger: 'change'},
        ],
        idcardReversePic: [
          { required: true, message: '请上传身份证反面', trigger: 'change'},
        ],
        orgCertCode: [
          { required: true,min:1,max:80, message: '请输入1~80位组织机构代码证号', trigger: 'blur' },
          { validator:validateAccount, trigger: 'blur' }
        ],
        legalBoss: [
          { required: true,max:20, message: '请输入法人代表，限20字符', trigger: 'blur' },
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' }
        ],
        businessPic: [
          { required: true, message: '请上传营业执照', trigger: 'change'},
        ],
        sortNo: [
          { required: true, message: '请输入排序', trigger: 'blur' },
          {validator: validateAccount, trigger: 'blur' }
        ]
      }
    }
  },
  mixins: [fixie9input],
  created (){
    var that  = this.formData
    this.formData.authType=1
  },
  mounted() {
    this.serviceTypeList=this.$store.state.allDic.allDictionary.package.dictionary;
    if(this.$route.query.id){
      this.formData.id=this.$route.query.id
      this.init(this.$route.query.id)
    }
    this.groupChange3()
    this.groupChange()
    this.areaChange('')
    let screenHeight=document.documentElement.clientHeight;
    this.rowHeight=screenHeight-140 +'px';
    const that = this;
    window.onresize = function temp() {
        that.rowHeight = `${document.documentElement.clientHeight-140}px`;
    };

  },
  computed: {
    idcardFrontDisabled() {
        return this.idcardFrontFileList.length >0
    },
    idcardReverseDisabled(){
      return this.idcardReverseFileList.length >0
    },
    businessFileDisabled(){
      return this.businessFileList.length >0
    }
  },
  methods: {
    init: function (id) {
      getICCardInfo(id).then(res =>{
        var that = this.formData
        var data = res.data
        that.id=data.id,
        that.groupId=data.groupId
        that.belongName=data.belongName
        that.centerIcCode=data.centerIcCode
        that.icCode=data.icCode
        that.tel=data.tel
        that.areaId=data.areaId
        that.address=data.address
        that.serviceType=data.serviceType
        that.endTime=data.endTime
        that.authType=parseInt(data.authType)
        that.idcard=data.idcard
        that.idcardFrontPic=data.idcardFrontPic
        this.areaIds=data.areaIds
        if(data.idcardFrontPic){
          this.idcardFrontFileList=[]
          var params = {}
          params.name=data.idcardFrontPic
          params.url=URLConfig.ossUrl+data.idcardFrontPic
          this.idcardFrontFileList.push(params)
        }
        that.idcardReversePic=data.idcardReversePic
        if(data.idcardReversePic){
          this.idcardReverseFileList=[]
          var params = {}
          params.name=data.idcardReversePic
          params.url=URLConfig.ossUrl+data.idcardReversePic
          this.idcardReverseFileList.push(params)
        }
        that.legalBoss=data.legalBoss
        that.orgCertCode=data.orgCertCode
        if(data.businessPic){
          this.businessFileList=[]
          var params = {}
          params.name=data.businessPic
          params.url=URLConfig.ossUrl+data.businessPic
          this.businessFileList.push(params)
        }
        that.businessPic=data.businessPic
        this.groupChange2(data.groupId)
        this.areaList2(data.areaId)
        this.changeShow()
      })
    },
    groupChange2(id){
      groupSelectEdit(id).then(response => {
        this.level = response.data[0].grade-this.relativeLevel
        this.listGroups=response.data
        this.nowgroups=response.data
        this.groupIds=response.data[0].ids
      })
    },
    groupChange3(){
      groupSelect().then(response => {
        this.relativeLevel = response.data[0].grade-1
      })
    },
    areaList2(id){
      areaSelectEdit(id).then(response => {
        this.arealevel = response.data[0].level;
        this.nowareas=response.data
        this.areaList=response.data;
      })
    },
    //时间格式化
    dateFormat(row, column) {
      let date = row[column.property];
      return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "";
    },
    submitForm (formName) {
       this.$refs[formName].validate(valid => {
          if (valid) {
              if(this.formData.authType==2){//单位认证
                 this.formData.idcard='';
                 this.formData.idcardFrontPic='';
                 this.formData.idcardReversePic='';
              }else if(this.formData.authType==1){//个人认证
                this.formData.legalBoss='';
                this.formData.orgCertCode='';
                this.formData.businessPic='';
              }
              if(this.formData.id){
                editCardList(this.formData).then(response =>{
                    if(response.success){
                        this.$message({
                          message: response.message,
                          type: 'success'
                        })
                        this.$router.push({path:"/card/cardList"})
                    }else{
                      this.$message({
                        message: response.message,
                        type: 'warning'
                      })
                    }
                })
              }else{
                addCardList(this.formData).then(response =>{
                    if(response.success){
                        this.$message({
                          message: response.message,
                          type: 'success'
                        })
                        this.$router.push({path:"/card/cardList"})
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
    changeShow:function(){
          this.personalShow=false;
          this.companyShow=false;
          if(this.formData.authType==2){//单位认证
            this.companyShow=true;
          }else if(this.formData.authType==1){//个人认证
            this.personalShow=true;
          }
     },
    resetForm (formName) {
      this.$router.push({path:"/card/cardList"})
    },
    // 上传文件之前的钩子
    handleBeforeUpload(file){
      if(!(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/bmp')) {
        this.$message({
          message:'请上传格式为image/png, image/jpg, image/jpeg的图片',
          type: 'warning'
        })
      }
      let size = file.size / 1024 / 1024 / 10
      if(size > 1) {
        this.$message({
          message:'图片大小必须小于10M',
          type: 'warning'
        })
      }
    },
    // 文件超出个数限制时的钩子
    handleExceed(files, fileList) {

    },
    // 文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      this.formData.idcardFrontPic='';
    },
    // 身份证正面移除文件时的钩子
    idcardFrontPicRemove(file, fileList) {
      this.formData.idcardFrontPic='';
      this.idcardFrontFileList=[];
      this.showByLabelFor('idcardFrontPic')
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleIdcardFrontPicSuccess(response, file, fileList) {//身份证正面上传成功
      if(response.success){
          this.formData.idcardFrontPic=response.data.imageName;
          var params = {}
          params.name=response.data.imageName
          params.url=URLConfig.ossUrl+response.data.imageName
          this.idcardFrontFileList.push(params)
          this.resetValidateByLabelFor('idcardFrontPic')
      }else{
        this.$message({
          message: response.message,
          type: 'warning'
        })
      }
    },
    handleIdcardReversePicSuccess(response, file, fileList) {//身份证反面上传成功
      if(response.success){
          this.formData.idcardReversePic=response.data.imageName;
          var params = {}
          params.name=response.data.imageName
          params.url=URLConfig.ossUrl+response.data.imageName
          this.idcardReverseFileList.push(params)
          this.resetValidateByLabelFor('idcardReversePic')
      }else{
        this.$message({
          message: response.message,
          type: 'warning'
        })
      }
    },
    // 身份证反面移除文件时的钩子
    idcardReversePicRemove(file, fileList) {
      this.formData.idcardReversePic='';
      this.idcardReverseFileList=[]
      this.showByLabelFor('idcardReversePic')
    },
    handleBusinessPicSuccess(response, file, fileList) {//营业执照上传成功
      if(response.success){
          this.formData.businessPic=response.data.imageName;
          var params = {}
          params.name=response.data.imageName
          params.url=URLConfig.ossUrl+response.data.imageName
          this.businessFileList.push(params)
          this.resetValidateByLabelFor('businessPic')
      }else{
        this.$message({
          message: response.message,
          type: 'warning'
        })
      }
    },
    // 营业执照移除文件时的钩子
    businessPicRemove(file, fileList) {
      this.formData.businessPic='';
      this.businessFileList=[];
      this.showByLabelFor('businessPic')
    },
    // 分组查询
    handleItemChange2(val) {
      var id=val[val.length-1]
      this.groupChange(id,val)
      this.formData.groupId=id
    },
    resetValidateByLabelFor(labelFor){
         var validates = this.$refs.userForm._data.fields
         var index = this._.findIndex(validates, [
           'labelFor',
           labelFor,
         ])
         validates[index].showMessage=false
    },
    showByLabelFor(labelFor){
         var validates = this.$refs.userForm._data.fields
         var index = this._.findIndex(validates, [
           'labelFor',
           labelFor,
         ])
         validates[index].showMessage=true
    },
    groupChange(id,ids){
      groupSelect(id).then(response => {
        if(response.data.length>0){
          setTimeout(() => {
              if(this.listGroups.length>0 && this.listGroups[0].grade<5 && response.data[0].grade<5 && this.i!==1){
                this.$refs.cascader2.menuVisible=true
              }
          }, 5);
          this.i++

          this.LevelAll=5-this.relativeLevel
          var levelAll=this.LevelAll
          this.level = response.data[0].grade-this.relativeLevel
          this.response[this.level - 1] = response.data;
          if (this.level < levelAll) {
            for(let i=0;i<response.data.length;i++){
              response.data[i].childTSysGroup=[]
            }
          }
          if (this.level <= levelAll) {
            if (this.level === 2) {
              this.cityindex = this._.findIndex(this.response[this.level-2], [
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
              this.countyindex = this._.findIndex(this.response[this.level-2], [
                'id',
                id,
              ])
              if(this.response[this.level-2]){
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
              this.blockindex = this._.findIndex(this.response[this.level-2], [
                'id',
                id,
              ])
              if(this.response[1]&&this.response[this.level-2]){
                if(this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup.length > 0){
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup = response.data
                }else{
                  this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup = response.data
                }
              }else if(!this.response[1]&&!this.response[this.level-2]){
                this.cityindex = this._.findIndex(this.response[0], [
                  'id',
                  ids[0],
                ])
                this.nowgroups[this.cityindex].childTSysGroup[0].childTSysGroup[0].childTSysGroup = response.data
              }else if(!this.response[1]&&this.response[2]){
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
               if(this.response[1] && this.response[2] && this.response[3]){
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
                }else{
                    if(this.response[0]){
                      this.cityindex = this._.findIndex(this.response[0], [
                        'id',
                        ids[0],
                      ])
                    }else{
                      this.cityindex=0
                    }
                    if(this.response[1]){
                      this.countyindex = this._.findIndex(this.response[1], [
                        'id',
                        ids[1],
                      ])
                    }else{
                      this.countyindex = 0
                    }
                    if(this.response[2]){
                      this.blockindex = this._.findIndex(this.response[2], [
                        'id',
                        ids[2],
                      ])
                    }else{
                       this.blockindex=0
                    }
                    if(this.response[3]){
                      this.unitindex = this._.findIndex(this.response[3], [
                        'id',
                        ids[3],
                      ])
                    }else{
                      this.unitindex = 0
                    }
                    this.nowgroups[this.cityindex].childTSysGroup[this.countyindex].childTSysGroup[this.blockindex].childTSysGroup[this.unitindex].childTSysGroup = response.data
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
    areaChange(id,ids){
      areaSelect(id).then(response => {
        if(response.data.length>0){
          console.log(response.data)
          setTimeout(() => {
              if(this.areaList.length>0 && this.areaList[0].level<4 && response.data[0].level<4 && this.z!==1){
                this.$refs.cascader3.menuVisible=true
              }
          },10);
          this.z++

          var levelAll=3
          this.arealevel = response.data[0].level
          this.areaResponse[this.arealevel-1] = response.data;
          if (this.arealevel < levelAll) {
            for(let i=0;i<response.data.length;i++){
              response.data[i].childTSysArea=[]
            }
          }
          if (this.arealevel <= levelAll) {
            if (this.arealevel === 2) {
              this.cityIndex = this._.findIndex(this.areaResponse[0], [
                'id',
                id
              ])
              if(this.nowareas.length >0 ){
                this.nowareas[this.cityIndex].childTSysArea = response.data
              }else{
                this.nowareas = response.data
                this.cityIndex = 0
              }
            } else if (this.arealevel === 3) {
              this.countyIndex = this._.findIndex(this.areaResponse[1], [
                'id',
                id,
              ])
              if(this.areaResponse[1]){
                  if(this.nowareas[this.cityIndex].childTSysArea.length > 0){
                    this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea = response.data
                  }else{
                    this.nowareas[this.cityIndex].childTSysArea = response.data
                  }
              }else{
                  this.cityIndex = this._.findIndex(this.areaResponse[0], [
                    'id',
                    ids[0],
                  ])
                  this.nowareas[this.cityIndex].childTSysArea[0].childTSysArea = response.data
              }
            } else {
              this.nowareas = response.data
            }
            this.areaList = this.nowareas
          } else {
            return 0
          }
        }
      })
    },
    // 分组查询
    handleAreaChange2(val) {
      var id=val[val.length-1]
      this.areaChange(id,val)
      this.formData.areaId=id
    },
    getUploadImageUrl:function(){
      return URLConfig.uploadImageUrl
    }
  }
}
</script>
<style>
.line {
  text-align: center;
}
.disabled .el-upload--picture-card {
    display: none;
}
</style>
