<template>
  <div class="vue-table-search">
    <slot></slot>
  </div>
</template>
<style lang="scss">
  .vue-table-search {
    padding: 12px 0 0px 20px;
    background: #F1F3F5;
    .el-form-item {
      margin-bottom: 12px;
    }
    .el-form-item__content{
      line-height: 30px;
    }
    .el-form-item__label{
      line-height: 30px;
    }
    .el-input__inner{
      height: 30px;
    }
    .el-button--small{
      padding: 8px 15px;
    }
  }
</style>
