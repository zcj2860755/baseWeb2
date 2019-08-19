import Cookies from 'js-cookie'

const TokenKey = 'token'
const JSESSIONID = 'JSESSIONID'
const AccountName = 'account'
const AccountId = 'accountId'
const RoleId = 'roleId'
const AuthIds = 'authIds'
const RealName = 'realName'
const proId = 'proId'
const GroupId = 'groupId'

// const AllDic='allDic'

export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  return Cookies.remove(TokenKey)
}

export function getID () {
  return Cookies.get(JSESSIONID)
}

export function setID (id) {
  return Cookies.set(JSESSIONID, id)
}

export function removeID () {
  return Cookies.remove(JSESSIONID)
}

export function getAccount () {
  return Cookies.get(AccountName)
}

export function setAccount (name) {
  return Cookies.set(AccountName, name)
}

export function removeAccount () {
  return Cookies.remove(AccountName)
}

export function getAccountId () {
  return Cookies.get(AccountId)
}

export function setAccountId (accountId) {
  return Cookies.set(AccountId, accountId)
}

export function getRoleId(){
  return Cookies.get(RoleId)
}

export function setRoleId (roleId) {
  return Cookies.set(RoleId, roleId)
}

export function getAuthIds(){
   return Cookies.get(AuthIds)
}

export function setAuthIds (authIds) {
  return Cookies.set(AuthIds, authIds)
}

export function setRealName (realName) {
  return Cookies.set(RealName, realName)
}
export function getRealName(){
  return Cookies.get(RealName)
}

export function setProjectId (projectId) {
  return Cookies.set(proId, projectId)
}
export function getProjectId(){
  return Cookies.get(proId)
}

export function setSource (projectId) {
  return Cookies.set(proId, projectId)
}
export function getSource(){
  return Cookies.get(proId)
}

export function setGroupId (groupId) {
  return Cookies.set(GroupId, groupId)
}
export function getGroupId(){
  return Cookies.get(GroupId)
}
