/**
 * Created by jiachenpan on 16/11/18.
 */
import fetch from '@/utils/fetch'
import Qs from 'qs'

import { existAccount } from '@/api/account'

export function isvalidUsername (str) {
  // const validMap = ['admin', 'editor', 'yhssj01', 'system','cesili','wangr']
  return str.trim().length > 0 && !isChinese(str)
}

/* 合法uri */
export function validateURL (textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/* 小写字母 */
export function validateLowerCase (str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母 */
export function validateUpperCase (str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母 */
export function validatAlphabets (str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/* 大小写字母 */
export function validateNumberAndEnglish (str) {
  const reg = /^[A-Za-z0-9]+$/
  return reg.test(str)
}

/*手机号码校验*/
export function isvalidPhone(str) {
  const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
  return reg.test(str)
}
/*中文校验*/
export function isChinese(str){
  const reg =/^[\u3220-\uFA29]+$/
  return reg.test(str)
}

/* 大小写字母或数字或中文 */
export function validateNumberAndEnglishAndChinese (str) {
  const reg = /^[A-Za-z0-9\u3220-\uFA29]+$/
  return reg.test(str)
}

export function isICCard(str){
  // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
  var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(str)
}

/* 数字校验 */
export function validateNumber (str) {
  const reg = /^[0-9]+$/
  return reg.test(str)
}

