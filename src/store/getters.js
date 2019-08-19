const getters = {
  sidebar: state => state.app.sidebar,
  token: state => state.user.token,
  account: state => state.user.account,
  JSESSIONID: state => state.user.JSESSIONID,
  accountId: state => state.user.accountId,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  authIds:state => state.user.authIds,
  userId: state => state.user.userId,
  groupId: state => state.user.groupId,
  realName: state => state.user.realName,
  roleId: state => state.user.roleId,
  signSet: state => state.user.signSet,
  flag: state => state.user.flag,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  allDictionary: state => state.allDic.allDictionary,
  accountSex: state => state.allDic.accountSex,
  allAuthSign:state => state.allDic.allAuthSign,
  source: state => state.user.source,
  noticeCount:state => state.user.noticeCount
}
export default getters