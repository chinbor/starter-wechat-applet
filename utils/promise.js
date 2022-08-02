/**
 * 给小程序 Promise 增加支持 finally
 * @param {function} callback
 */
if (typeof Promise.prototype.finally !== 'function') {
  /* eslint-disable */
  Promise.prototype.finally = function (callback) {
    let P = this.constructor
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason =>
        P.resolve(callback()).then(() => {
          throw reason
        }),
    )
  }
}
