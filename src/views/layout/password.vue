<template>
    <section>
        <el-dialog :visible.sync="tData" :title="editModel.title" width="25%" class="tip-dialog">
            <el-row>
                <el-form :model="formData" :rules="rules" ref="userForm" label-width="100px">
                    <el-form-item label="原密码">
                        <el-input v-model="formData.oldPassword" @blur="fixinput('oldPassword')" @change="forbiddenAutoFill($event,'oldPassword')" placeholder="请输入 6-20 位密码"></el-input>
                    </el-form-item>

                    <el-form-item label="新密码">
                        <el-input type="password" v-model="formData.password" @blur="fixinput('password')" @change="forbiddenAutoFill($event,'password')" auto-complete="off" placeholder="请输入 6-20 位密码"></el-input>
                    </el-form-item>

                    <el-form-item label="确认密码">
                        <el-input type="password" v-model="formData.password" @blur="fixinput('password')" @change="forbiddenAutoFill($event,'password')" auto-complete="off" placeholder="请再输入一遍密码"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="submitForm('userForm')">确认</el-button>
                        <el-button @click="resetForm('userForm')">取消</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
        </el-dialog>
    </section>
</template>

<script>
import { editAccount, submitAccount ,verifyAccount} from '@/api/accountDetail'
import { fixie9input } from '@/components/Mixin/fixie9input'
export default {
    name: 'password',
    props:['tableData'],
    data () {
        var validateAccount = (rule, value, callback) => {
            if(!this.isEdit){
                existAccount(value).then(response =>{
                if(response.existAccount){
                    callback(new Error('账号已存在!'))
                }else if(!validateNumberAndEnglish(value)){
                    callback(new Error('请输入数字或英文!'))
                }else{
                    callback()
                }
                })
            }else if(!validateNumberAndEnglish(value)){
                callback(new Error('请输入数字或英文!'))
            }else{
                callback()
            }
        }
        var validatePass2 = (rule, value, callback) => {
            if (value !== this.formData.pass) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }

        return {
            tData: this.tableData,
            isEdit: false,
            editModel: {
            show: false,
            title: '修改密码'
            },
            formData: {
                accountId:'',
                account: '',
                pass: '',
                password: '',
                realName: '',
            },
            ieForm:{
                pass: '',
                password: '',
                realName: '',
            },
            rules: {
                account: [
                { required: true, message: '请输入账号', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
                {validator: validateAccount, trigger: 'blur' }
                ],
                realName: [{ required: true,min: 0, max: 20, message: '请保持长度在 20 位及以下', trigger: 'blur'}],
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
    mixins: [fixie9input],
    created (){
        var id = this.$route.query.id
        var that  = this.formData
        if(id) {
            this.init(id,that)
            this.isEdit = true
        }else{
            this.formData.id=''
        }
        console.log(this.tData)
    },
    methods: {
        forbiddenAutoFill(val,name){
            var isSupportPlaceholder = 'placeholder' in document.createElement('input')
            if(!isSupportPlaceholder){
                this.ieForm[name] = val
            }
        },
        init: function (id,that) {
            var local = this
            editAccount(id).then(response =>{
            that.id = response.data.id
            that.account = response.data.account
            that.realName = response.data.realName
            })
        },
        submitForm (formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                var params={} ;
                params.id = this.formData.id;
                params.account = this.formData.account;
                params.password = this.formData.password;
                submitAccount(params).then(response =>{
                    if(response.success){
                    this.$message({
                        message: response.message,
                        type: 'success'
                    })
                    this.$router.push({path:'/system/account'})
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

    }

}
</script>

