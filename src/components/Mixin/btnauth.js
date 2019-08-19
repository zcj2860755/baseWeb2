export const btnauth = {
    methods: {
        hasAuth: function (auth) {
          var allAuthList = this.$store.state.allDic.allAuthSign
          var path = this.$route.path
        //   console.log('sugn')
        //   console.log(path)
          // console.log(allAuthList)
          return allAuthList.indexOf(auth) > -1
        }
    }
}
