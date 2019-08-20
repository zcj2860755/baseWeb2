import fetch from '@/utils/fetch'
import Qs from 'qs'

// export function login (username, password) {
//   return fetch({
//     url: '/token/login',
//     method: 'post',
//     data: Qs.stringify({ username: username, password: password })
//   })
// }

// export function logout () {
//   return fetch({
//     url: '/token/logout',
//     method: 'post'
//   })
// }

export function login (username, password) {
  return fetch({
    url: '/base/account/login',
    method: 'post',
    data: Qs.stringify({ account: username, password: password })
  })
}

export function logout (id) {
  return fetch({
    url: '/account/logout',
    method: 'post',
    data: Qs.stringify({id: id })
  })
}
