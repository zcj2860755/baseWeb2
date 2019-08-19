<template>
<div class="app-small" style="background:#fff;">
    <el-row  :style="{height:rowHeight}" style="overflow-y: auto;">
      <el-col :span="23" :offset="1" style="margin-top:50px;">
        <el-form :model="formData" :rules="rules" ref="deviceForm" label-width="160px">
          <el-col :span="10">
            <el-form-item label="所属分组" prop="groupId">
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
          <el-col :span="10" >
            <el-form-item label="姓名/单位" prop="belongName">
              <el-input v-model="formData.belongName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
            <el-form-item label="终端序列号" prop="deviceCode">
              <el-input v-model="formData.deviceCode"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="formData.deviceName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
            <el-form-item label="设备类型" prop="deviceType">
              <el-select v-model="formData.deviceType" placeholder="请选择设备类型" style="width:100%">
                <el-option v-for="item in deviceTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
            <el-form-item label="设备型号" prop="deviceModel">
              <el-input v-model="formData.deviceModel"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
            <el-form-item label="联系人" prop="name">
              <el-input v-model="formData.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
            <el-form-item label="手机号码" prop="tel">
              <el-input v-model="formData.tel"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" >
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

          <el-col :span="10" >
            <el-form-item label="北斗民用IC卡" prop="icCardId">
              <el-select v-model="formData.icCardId" placeholder="请输入IC卡或姓名" style="width:100%">
                <el-option v-for="item in icCardList"
                :key="item.id"
                :label="`${item.belongName}（${item.icCode}）`"
                :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="10" >
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="formData.address" ></el-input>
            </el-form-item>
          </el-col>
          <!-- 提交表单 -->
          <el-col :span="22" style="text-align: center;padding:40px 0;">
            <!-- <el-form-item> -->
              <el-button type="primary" @click="submitForm('deviceForm')">保存</el-button>
              <el-button @click="resetForm('deviceForm')">取消</el-button>
            <!-- </el-form-item> -->
          </el-col>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {isvalidPhone,validateNumberAndEnglish,isICCard,validateNumber,isChinese,validateNumberAndEnglishAndChinese } from '@/utils/validate'
import {getICCardByBind} from '@/api/icard'
import {getDeviceInfoById,addDeviceInfo,editDeviceInfo} from '@/api/device'
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
     var validNumOrEnglishOrChinese=(rule, value,callback)=>{
      if (value&&!(validateNumberAndEnglishAndChinese(value))){
        callback(new Error('请输入数字，英文或中文'))
      }else {
          callback()
      }
    }
    return {
      rowHeight:'',
      listGroupId:[],
      listGroups:[],
      areaList:[],
      groups:[],
      groupIds:[],
      areaIds:[],
      response: [],
      areaResponse:[],
      icCardList:[],
      nowgroups:[],
      level: '',
      arealevel:'',
      relativeLevel:'0',
      i:'1',
      z:0,
      x:0,
      levelAll:'0',
      deviceTypeList:[],
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
      formData: {
        id:'',
        groupId:'',
        belongName:'',
        deviceCode: '',
        deviceName:'',
        deviceType:'',
        deviceModel:'',
        name:'',
        tel:'',
        areaId:'',
        address:'',
        icCardId:''
      },
      rules: {
        groupId: [
          { required: true, message: '请选择所属分组', trigger: 'change' }
        ],
        belongName: [
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' },
          { required: true,min:1,max:80, message: '请输入姓名/单位，范围1~80', trigger: 'blur' },
        ],
        deviceCode: [
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' },
          { required: true,min:2,max:40, message: '请输入终端序列号，范围2~40', trigger: 'blur' },
        ],
        deviceName: [
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' },
          { required: true,min:2,max:30, message: '请输入设备名称，范围2~30', trigger: 'blur' },
        ],
        deviceType: [
          { required: true, message: '请输入设备类型', trigger: 'change' }
        ],
      /*  deviceModel: [
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' },
          { min:2,max:30, message: '请输入设备型号，范围2~30', trigger: 'blur' },
        ],*/
        name: [
          { validator:validNumOrEnglishOrChinese, trigger: 'blur' },
          { required: true,max:20, message: '请输入联系人,范围1~20', trigger: 'blur' },
        ],
        tel: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator:validPhone, trigger: 'blur' },
        ],
        areaId: [
          { required: true, message: '请输入联系地址', trigger: 'change' }
        ],
        address:[
           { validator:validNumOrEnglishOrChinese, trigger: 'blur' },
           { required: true,min:4,max:50, message: '请输入详细地址，范围4~50', trigger: 'blur' },
         ],
        icCardId: [
          { required: true, message: '请输入北斗民用IC卡', trigger: 'blur' }
        ]
      }
    }
  },
  mixins: [fixie9input],
  created (){

  },
  mounted() {
    this.deviceTypeList=this.$store.state.allDic.allDictionary.deviceType.dictionary;
    if(this.$route.query.id){
      this.formData.id=this.$route.query.id
      this.init(this.$route.query.id)
    }
    this.getICCardList(this.formData.id)
    this.groupChange()
    this.areaChange('')
    let screenHeight=document.documentElement.clientHeight;
    this.rowHeight=screenHeight-140 +'px';
    const that = this;
    window.onresize = function temp() {
        that.rowHeight = `${document.documentElement.clientHeight-140}px`;
    };
  },
  methods: {
    init: function (id) {
      getDeviceInfoById(id).then(res =>{
        var that = this.formData
        var data = res.data
        that.id=data.id,
        that.groupId=data.groupId
        that.belongName=data.belongName
        that.deviceCode=data.deviceCode
        that.deviceName=data.deviceName
        that.deviceType=data.deviceType
        that.deviceModel=data.deviceModel
        that.tel=data.tel
        that.name=data.name
        that.areaId=data.areaId
        that.address=data.address
        this.areaIds=data.areaIds
        that.icCardId=data.icCardId
        this.groupChange2(data.groupId)
        this.areaList2(data.areaId)

      })
    },
    getICCardList(id){
      getICCardByBind(id).then(response => {
        if(response.success){
          this.icCardList=response.data
        }
      })
    },
    groupChange2(id){
      groupSelectEdit(id).then(response => {
        this.level = 1
        this.listGroups=response.data
        this.nowgroups = response.data
        this.groupIds=response.data[0].ids
      })
    },
    areaList2(id){
      areaSelectEdit(id).then(response => {
        this.arealevel = response.data[0].level;
        this.nowareas = response.data;
        this.areaList=response.data;
      })
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if(this.formData.id){
            editDeviceInfo(this.formData).then(response =>{
                if(response.success){
                    this.$message({
                      message: response.message,
                      type: 'success'
                    })
                    this.$router.push({path:"/card/deviceList"})
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
            })
          }else{
            addDeviceInfo(this.formData).then(response =>{
                if(response.success){
                    this.$message({
                      message: response.message,
                      type: 'success'
                    })
                    this.$router.push({path:"/card/deviceList"})
                }else{
                  this.$message({
                    message: response.message,
                    type: 'warning'
                  })
                }
            })
          }
        }}
      )
    },
    resetForm (formName) {
      this.$router.push({path:"/card/deviceList"})
    },
    // 分组查询
    handleItemChange2(val) {
      var id=val[val.length-1]
      this.groupChange(id,val)
      this.formData.groupId=id
    },
    groupChange(id,ids){
      groupSelect(id).then(response => {
        if(response.data.length>0){
          if(this.i==1){
            this.relativeLevel = response.data[0].grade-1
            this.i++;
          }
          setTimeout(() => {
              if(this.listGroups.length>0 && this.listGroups[0].grade<5 && response.data[0].grade<5 && this.x!==1){
                this.$refs.cascader2.menuVisible=true
              }
          }, 10);
          this.x++
          var levelAll=5-this.relativeLevel
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
            } else if (this.arealevel === 4) {
              this.blockindex = this._.findIndex(this.areaResponse[2], [
                'id',
                id,
              ])
              if(this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea.length > 0){
                this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea[this.blockindex].childTSysArea = response.data
              }else{
                this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea = response.data
              }

            } else if (this.arealevel === 5) {
              this.unitindex = this._.findIndex(this.areaResponse[3], [
                'id',
                id,
              ])
              if(this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea[this.blockIndex].childTSysArea.length > 0){
                this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea[this.blockIndex].childTSysArea[this.unitIndex].childTSysArea = response.data
              }else{
                this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea[this.blockIndex].childTSysArea = response.data
                this.nowareas[this.cityIndex].childTSysArea[this.countyIndex].childTSysArea[this.blockIndex].childTSysArea[this.unitIndex].childTSysArea =null
              }

            }  else {
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
    }
  }
}
</script>
<style>
.line {
  text-align: center;
}

</style>
