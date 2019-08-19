<template>
  <div class="app-wrapper" :style="{ height: wrapperHeight }">
    <navbar @show="passwordShow"></navbar>
    <div style="overflow:hidden">
      <div class="sidebar-wrapper" :class="{thinerwrapper:!sidebar.opened}">
        <sidebar class="sidebar-container"></sidebar>
      </div>
      <div class="main-container" :class="{widercontainer:!sidebar.opened}">
        <app-main ref="appMainRef"></app-main>
        <el-dialog :visible.sync="tableData" :title="editModel.title" width="25%" class="tip-dialog">
            <el-row>
                <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
                    <el-form-item label="原密码" prop="oldPassword">
                        <el-input v-model="formData.oldPassword" @blur="fixinput('oldPassword')" @change="forbiddenAutoFill($event,'oldPassword')" placeholder="请输入 6-20 位密码"></el-input>
                    </el-form-item>

                    <el-form-item label="新密码" prop="pass">
                        <el-input type="password" v-model="formData.pass" @blur="fixinput('pass')" @change="forbiddenAutoFill($event,'pass')" auto-complete="off" placeholder="请输入 6-20 位密码"></el-input>
                    </el-form-item>

                    <el-form-item label="确认密码" prop="password">
                        <el-input type="password" v-model="formData.password" @blur="fixinput('password')" @change="forbiddenAutoFill($event,'password')" auto-complete="off" placeholder="请再输入一遍密码"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="submitForm('userForm')">确认</el-button>
                        <el-button @click="resetForm('userForm')">取消</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
        </el-dialog>
        <!-- <password :table-data="tableData"></password> -->
      </div>
    </div>
    <div class="copyright">2019-2022 © Copyright. 浙大正呈科技有限公司 - All Rights Reserved.</div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain,password } from '@/views/layout'
import { updatePW } from '@/api/accountDetail'
import {getAccountId} from '@/utils/auth'
import { fixie9input } from '@/components/Mixin/fixie9input'
export default {
    name: 'layout',
    components: {
        Navbar,
        Sidebar,
        AppMain,
        password
    },
    data () {
        var validatePass2 = (rule, value, callback) => {
            if (value !== this.formData.pass) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        return {
            wrapperHeight:'',
            tableData:false,
            isEdit: false,
            editModel: {
                show: false,
                title: '修改密码'
            },
            formData: {
                pass: '',
                password: '',
                oldPassword: '',
            },
            ieForm:{
                pass: '',
                password: '',
                oldPassword: '',
            },
            rules: {
                oldPassword: [
                    { required: true,min: 6, max: 20, message: '请保持长度在 6 到 20 位', trigger: 'blur' }
                ],
                pass: [
                    { required: true,min: 6, max: 20, message: '请保持长度在 6 到 20 位', trigger: 'blur' },
                    { validator: validatePass2, trigger: 'blur' }
                ],
                password: [
                    { required: true,min: 6, max: 20, message: '请保持长度在 6 到 20 位', trigger: 'blur' },
                    {validator: validatePass2, trigger: 'blur' }
                ],
            }

        }
    },
    mounted() {
        let screenHeight=document.documentElement.clientHeight;
        let screenWidth=document.documentElement.clientWidth;
        this.wrapperHeight = screenHeight-30 +'px';
        const that = this;
        window.onresize = function temp() {
          that.wrapperHeight = `${document.documentElement.clientHeight-30}px`;
        };
    },
    mixins: [fixie9input],
    computed: {
        sidebar () {
            return this.$store.state.app.sidebar
        }
    },
    methods:{
        passwordShow(data){
            //   console.log(data)
            this.formData={
                pass: '',
                password: '',
                oldPassword: '',
            }
            this.tableData=data
        },
        forbiddenAutoFill(val,name){
            var isSupportPlaceholder = 'placeholder' in document.createElement('input')
            if(!isSupportPlaceholder){
                this.ieForm[name] = val
            }
        },
        submitForm (formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    var params={} ;
                    params.id = getAccountId();
                   //console.log(getAccountId())
                    params.oldPassword = this.formData.oldPassword;
                    params.password = this.formData.password;
                    updatePW(params).then(response =>{
                        this.tableData=false
                        if(response.success){
                            this.$message({
                                message: response.message,
                                type: 'success'
                            })
                            this.$store.dispatch('LogOut').then(() => {
                                location.reload()
                            })
                        }else{
                            this.$message({
                                message: response.message,
                                type: 'warning'
                            })
                        }
                    })
                } else {
                    //console.log('error submit!!')
                    return false
                }
            })
        },
        resetForm(){
            this.tableData=false
            this.formData={
                pass: '',
                password: '',
                oldPassword: '',
            }
        },
        dateRefresh(){
           this.$refs.appMainRef.$children[1].doneSubmit()
        }
    }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    @import "src/styles/mixin.scss";
    .app-wrapper {
        @include clearfix;
        position: relative;
        height: 100%;
        width: 100%;
        background-color: #E9EDF3;
        .copyright{
            font-size: 12px;
            background-color: #D2D9E4;
            height: 30px;
            color: #A4ADBB;
            line-height: 30px;
            padding-left: 10px;
            position: fixed;
            z-index: 10;
            left: 0;
            bottom: 0;
            width: 100%;
            text-align: center;
        }
        &.hideSidebar {
            .sidebar-wrapper {
                transform: translate(-134px, 0);
                .sidebar-container {
                    transform: translate(126px, 0);
                }
            }
            .main-container {
                margin-left: 46px;
            }
        }
        .sidebar-wrapper {
            margin-top: 46px;
            max-width: 200px;
            float: left;
            position: fixed;
            top: 5px;
            bottom: 0;
            left: 0;
            z-index: 1001;
            overflow: hidden;
            background:linear-gradient(180deg,rgba(41,117,230,1),rgba(146,73,255,1));
            box-shadow:0px 2px 5px 0px rgba(0, 0, 0, 0.15);
        }
        .thinerwrapper{
            width: 64px;
            overflow: hidden;
        }
        .sidebar-container {
            // position: absolute;
            // top: 0;
            // bottom: 0;
            // left: 0;
            // right: -17px;
            // overflow-y: scroll;
        }
        .main-container {
            min-height: 100%;
            transition: all .28s ease-out;
            margin-left: 200px;
            margin-top: 30px;
        }
        .widercontainer{
            margin-left: 64px;
        }
    }
</style>
