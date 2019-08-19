import Vue from 'vue'
import Router from 'vue-router'
import Layout from '../views/layout/Layout'
const _import = require('./_import_component')

Vue.use(Router)

/**
 * hidden: true                   如果设置 `hidden:true` 将不在侧边栏上显示(默认是false)
 * alwaysShow: true               如果设置 true, 将一直显示, 不管子菜单的个数
 *                                如果未设置, 只有多于1个子菜单时才变为嵌套模式，否则不显示
 * redirect: noredirect           如果设置 `redirect:noredirect` 将不在面包屑导航中显示
 * name:'router-name'             该名称将用来设置 <keep-alive> (必需设置!!!)
 * meta : {
    roles: ['admin','editor']    根据角色控制页面权限 (可以设置多个角色)
    title: 'title'               该名称用来设置子菜单和面包屑导航
    icon: 'svg-name'             侧边栏上的小图标,
    noCache: true                页面是否缓存，默认为false，缓存
  }
 **/

// 不需要权限的路由表
export const constantRouterMap = [
  {path: '/login', component: _import('/login/index'), hidden: true},
  {path: '/404', component: _import('/404'), hidden: true},
  {path: '/home/index2', component: _import('/home/index2'), hidden: true},

  {
    path: '/home', // views中文件夹的名称，下面的children为vue文件的名称
    component: Layout,
    hidden: true,
    redirect: '/home/index',
    name: '首页',
    icon: 'home',
    children: [
      /*{path: 'index', name: '综合统计', component: _import('/home/index')},*/
    ]
  },


  // 这里是在本地添加路由的示例(没有权限控制),28-39行;使用时复制，并修改对应名称及路径
/* {
    path: '/home', // views中文件夹的名称，下面的children为vue文件的名称
    component: Layout,
    hidden: false,
    redirect: '/home/index',
    name: '首页',
    icon: 'home',
    authType:'0',
    children: [
      {path: 'index', name: '综合统计', component: _import('/home/index')},
    ]
  },*/
 {
    path: '/message', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: false,
    component: Layout,
    redirect: '/message/outbox',
    name: '短信管理',
    icon: 'duanxinguanli',
    authType:'1',
    children: [
      /*{path: 'outbox', name: '发信息', authType:'1',component: _import('/message/outbox')},
      {path: 'inbox', name: '收件箱', authType:'1',component: _import('/message/inbox')},
      {path: 'hasSend', name: '已发送', authType:'1',component: _import('/message/hasSend')},
      {path: 'draft', name: '草稿箱', authType:'1',component: _import('/message/draft')},
      {path: 'mailList', name: '通讯录', authType:'1',component: _import('/message/mailList')},
      {path: 'mailGroup', name: '通讯录分组', authType:'2',component: _import('/message/mailGroup')}*/
    ]
  },
 {
    path: '/location', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: true,
    component: Layout,
    redirect: '/location/location',
    name: '定位管理',
    icon: 'dingweiguanli',
    authType:'1',
    children: [
      /* {path: 'point', name: '实时位置', authType:'1',component: _import('/location/location')},
      {path: 'track', name: '历史轨迹', authType:'1',component: _import('/location/track')}*/
    ]
  },
  {
    path: '/base', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: true,
    component: Layout,
    redirect: '/base/group',
    name: '基础信息',
    icon: 'jichuxinxi',
    authType:'1',
    children: [
      /* {path: 'group', name: '分组管理', authType:'1',component: _import('/base/group')}*/
    ]
  },
  {
    path: '/card', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: true,
    component: Layout,
    redirect: '/card/cardList',
    name: '设备管理',
    icon: 'shebeiguanli',
    authType:'1',
    children: [
      /*{path: 'cardList', name: '北斗民用IC卡管理', authType:'1',component: _import('/card/cardList')},
      {path: 'cardAdd', name: '北斗民用IC卡新增', authType:'2',component: _import('/card/cardEdit')},
      {path: 'cardEdit', name: '北斗民用IC卡编辑', authType:'2',component: _import('/card/cardEdit')},
      {path: 'deviceList', name: '北斗民用终端管理', authType:'1',component: _import('/device/deviceList')},
      {path: 'deviceAdd', name: '北斗民用终端新增', authType:'2',component: _import('/device/deviceEdit')},
      {path: 'deviceEdit', name: '北斗民用终端编辑', authType:'2',component: _import('/device/deviceEdit')},
      {path: 'command', name: '指挥机管理', authType:'1',component: _import('/device/command')}*/
    ]
  },
 {
    path: '/sos', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: true,
    component: Layout,
    redirect: '/sos/sosInbox',
    name: '应急救援',
    icon: 'yingjijiuyuan',
    authType:'1',
    children: [
      /* {path: 'sosInbox', name: '一键SOS', authType:'1',component: _import('/message/sosInbox')}*/
    ]
  },
  {
    path: '/system', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: false,
    component: Layout,
    redirect: '/system/account',
    name: '系统管理',
    icon: 'setup',
    children: [
      // {path: 'base', name: '基础参数', authType:'1', component: _import('/system/base')},
      // {path: 'auth', name: '权限参数', authType:'1', component: _import('/system/auth')},
      // {path: 'categoryList', name: '字典类别', authType:'1', component: _import('/system/categoryList')},
      {path: 'dicList', name: '字典类别详情', authType:'2', component: _import('/system/dicList')},
      // {path: 'account', name: '账号管理', authType:'1', component: _import('/system/account')},
      // {path: 'role', name: '角色管理', authType:'1', component: _import('/system/role')},
      {path: 'account/accountAdd', name: '用户管理新增', authType:'2', component: _import('/system/accountEdit')},
      {path: 'account/accountEdit', name: '用户管理编辑', authType:'2', component: _import('/system/accountEdit')},
      {path: 'roleDetail', name: '角色管理详情', authType:'2', component: _import('/system/roleDetail')}
    ]
  },
  {
    path: '/card', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: false,
    component: Layout,
    redirect: '/card/cardList',
    name: '设备管理',
    icon: 'shebeiguanli',
    children: [
      {path: 'cardList/cardAdd', name: '北斗民用IC卡新增', authType:'2',component: _import('/card/cardEdit')},
      {path: 'cardList/cardEdit', name: '北斗民用IC卡编辑', authType:'2',component: _import('/card/cardEdit')},
      {path: 'deviceList/deviceAdd', name: '北斗民用终端新增', authType:'2',component: _import('/card/deviceEdit')},
      {path: 'deviceList/deviceEdit', name: '北斗民用终端编辑', authType:'2',component: _import('/card/deviceEdit')},
    ]
  },
   /*  {
    path: '/card', // views中文件夹的名称，下面的children为vue文件的名称
    noDropdown: true,
    component: Layout,
    redirect: '/card/cardList',
    name: '设备管理',
       icon: 'shebeiguanli',
       authType:'1',
      children: [
     {path: 'card', name: '设备管理', component: _import('/card/')},card
    ]
  },*/
  // {path: '/equip/location', component: _import('/equip/location'),name: '实时定位',icon: 'setup', hidden: false},
  // {path: '/equip/track', component: _import('/equip/track'),name: '历史轨迹',icon: 'setup', hidden: false},
  // {
  //   path: '/equip', // views中文件夹的名称，下面的children为vue文件的名称
  //   noDropdown: true,
  //   component: Layout,
  //   redirect: '/equip/location',
  //   name: '实时定位',
  //   icon: 'setup',
  //   children: [
  //     {path: 'location', name: '实时定位', component: _import('/equip/location')},
  //   ]
  // },
  // {
  //   path: '/equip', // views中文件夹的名称，下面的children为vue文件的名称
  //   noDropdown: true,
  //   component: Layout,
  //   redirect: '/equip/track',
  //   name: '历史轨迹',
  //   icon: 'setup',
  //   children: [
  //     {path: 'track', name: '历史轨迹', component: _import('/equip/track')},
  //   ]
  // }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})
