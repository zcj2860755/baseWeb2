<template>
  <div>

  </div>
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    created() {
      
    },
    mounted() {
        console.log(this.$store.state.permission.addRouters[0].children[0].authFilePath)
        var authFilePath=this.$store.state.permission.addRouters[0].children[0].authFilePath
        this.$router.push({path: authFilePath})
    },

    methods: {
      

    }
  }
</script>
