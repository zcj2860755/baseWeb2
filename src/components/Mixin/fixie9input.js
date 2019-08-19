export const fixie9input = {
    methods: {
        fixinput: function(name){
            var isSupportPlaceholder = 'placeholder' in document.createElement('input')
            if(!isSupportPlaceholder){
                var path = this.$route.path
                if(path == '/login'){
                    this.loginForm[name] = this.ieForm[name]
                }else {
                   this.formData[name] = this.ieForm[name]
                }
            }
        }
    }
}