export const placeholderie = {
    mounted() {
        var path = this.$route.path
        var isSupportPlaceholder = 'placeholder' in document.createElement('input')
        if(!isSupportPlaceholder){
            if(this._.has(this.listQuery,'param')){
                this.listQuery.param = '姓名/车牌号/手机号'
            }

            if(path === '/system/base'){
                if(this._.has(this.listQuery,'keyword')){
                    this.listQuery.keyword = '参数名称/参数编码/参数值'
                }
            }else if(path == '/system/account'){
                if(this._.has(this.listQuery,'keyword')){
                    this.listQuery.keyword = '账号/姓名/手机/邮箱'
                }
            }else if(path == '/system/org'){
                if(this._.has(this.listQuery,'keyword')){
                    this.listQuery.keyword = '组织名称'
                }
            }else if(path == '/system/role'){    
                if(this._.has(this.listQuery,'keyword')){
                    this.listQuery.keyword = '角色名称'
                }
            } else {
                if(this._.has(this.listQuery,'keyword')){
                    this.listQuery.keyword = '姓名/身份证号/手机号/车牌号'
                }
            }
        }
    },
    methods: {
        inputfocus: function(name){
            var isSupportPlaceholder = 'placeholder' in document.createElement('input')
            if(!isSupportPlaceholder){
                if(name == 'alarm'){
                    if(this.listQuery.param == '姓名/车牌号/手机号'){
                        this.listQuery.param = ''
                    }
                }
                if(name == 'vehicle'){
                    if(this.listQuery.keyword == '姓名/身份证号/手机号/车牌号'){
                        this.listQuery.keyword = ''
                    }
                }


                if(name == 'base'){
                    if(this.listQuery.keyword == '参数名称/参数编码/参数值'){
                        this.listQuery.keyword = ''
                    }
                }

                if(name == 'account'){
                    if(this.listQuery.keyword == '账号/姓名/手机/邮箱'){
                        this.listQuery.keyword = ''
                    }
                }

                if(name == 'org'){
                    if(this.listQuery.keyword == '组织名称'){
                        this.listQuery.keyword = ''
                    }
                }

                if(name == 'role'){
                    if(this.listQuery.keyword == '角色名称'){
                        this.listQuery.keyword = ''
                    }
                }
            }
        },
        inputblur: function(name){
            var isSupportPlaceholder = 'placeholder' in document.createElement('input')
            if(!isSupportPlaceholder){
                if(name == 'alarm'){
                    if(this.listQuery.param == ''){
                        this.listQuery.param = '请输入关键字'
                    }
                }
                if(name == 'vehicle'){
                    if(this.listQuery.keyword == ''){
                        this.listQuery.keyword = '姓名/身份证号/手机号/车牌号'
                    }
                }

                if(name == 'base'){
                    if(this.listQuery.keyword == ''){
                        this.listQuery.keyword = '参数名称/参数编码/参数值'
                    }
                }

                if(name == 'account'){
                    if(this.listQuery.keyword == ''){
                        this.listQuery.keyword = '账号/姓名/手机/邮箱'
                    }
                }

                if(name == 'org'){
                    if(this.listQuery.keyword == ''){
                        this.listQuery.keyword = '组织名称'
                    }
                }

                if(name == 'role'){
                    if(this.listQuery.keyword == ''){
                        this.listQuery.keyword = '角色名称'
                    }
                }
            }
        }
    }
}