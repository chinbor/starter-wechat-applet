// import fetch from '../index'

export default {
  login(code, silent = false) {
    // FIXME: 换成网络请求
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          access_token: '123asdasd123acasffgerf',
          expires_in: 3600 * 24 * 7,
          user_info: {
            id: '1',
            name: 'chinbor',
            avatar: 'https://chinbor.avatar.com/chinbor.png',
          },
        })
      }, 500)
    })
  },

  // authenticationStatus字段 1 2 3 4 5 6 7
  getUserInfo(id, silent = false) {
    // FIXME: 换成网络请求
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: '1',
          name: 'chinbor',
          avatar: 'https://chinbor.avatar.com/chinbor.png',
        })
      }, 500)
    })
  },

  bindPhoneNum(data, silent = false) {
    // FIXME: 换成网络请求
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: 'xxxxxxxxxxx',
        })
      }, 500)
    })
  },

  updateUserInfo(data, silent = false) {
    // FIXME: 换成网络请求
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  },
}
