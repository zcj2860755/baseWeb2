<template>
    <el-cascader
      v-model="group"
      :options="options"
      @change="sendData"
      :clearable="true"
      :change-on-select="true"
      :props="props">
    </el-cascader>
</template>
<script>
import { getArea, echoAreaJson } from '@/api/org'
export default {
  props: {
    activeid: ''
  },
  data () {
    return {
      areaId: '',
      group: [],
      options: [],
      props: {
        value: 'id',
        label: 'label',
        children: 'cities'
      },
      level: '',
      cityindex: '',
      countyindex: '',
      response: [],
    }
  },
  methods: {
    getAreaData() {
      getArea({
        areaId: this.areaId,
      }).then(response => {
        console.log(response.items[0])
        this.level = response.items[0].level
        this.response[this.level - 1] = response.items
        if (this.level < 4) {
          if (this.level === 2) {
            
             this.cityindex = this._.findIndex(this.response[0], [
              'id',
              this.areaId,
            ])
            if(this.options.length >0 ){
              this.options[this.cityindex].cities = response.items
            }else{
              this.options = response.items
              this.cityindex = 0
            }
          } else if (this.level === 3) {
            this.countyindex = this._.findIndex(this.response[1], [
              'id',
              this.areaId,
            ])
            if(this.options[this.cityindex].cities.length > 0){
              this.options[this.cityindex].cities[this.countyindex].cities = response.items
            }else{
              this.options[this.cityindex].cities = response.items
            }
            
          } else {
            this.options = response.items
          }
        } else {
          return 0
        }
      })
    },
    getInitArea() {
      echoAreaJson({
        areaId: this.activeid
      }).then(response => {
        // options
        this.options = response.options
        this.response[0] = this.options
        
        // group
        this.group = response.group

        // index
        var p = this.group[0]
        var pindex = this._.findIndex(this.options,['id', p])
        this.response[1] = this.options[pindex].cities
        this.cityindex = pindex

        if(this.group.length > 1){
            var s = this.group[1]
            var sindex = this._.findIndex(this.options[pindex].cities,['id', s])
            this.countyindex =sindex
            this.response[2] = this.options[pindex].cities[sindex].cities
        }
      })
    },
    // handleItemChange (val) {
    //   var id = val[val.length - 1]
    //   console.log(val)
    //   this.areaId = id
    //   this.getAreaData()
    // },
    sendData: function (val) {
      var id = val[val.length - 1]
      this.areaId = id
      if(val.length<3){
        this.getAreaData()
      }
      
      var selected = val[val.length - 1]
      this.$emit('selected',selected)
    }
  },
  created () {
    var isEdit = this.$route.query.isEdit
    if (!isEdit) {
      this.getAreaData()
    } else {
      this.getInitArea()
    }
  }
}
</script>
