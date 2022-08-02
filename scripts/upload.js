/* eslint-disable no-console */
// wx9a722b51e5ef19d3
// 商户 功能板块 特性
const ci = require('miniprogram-ci')
const { wxVersion: version, wxDesc: desc } = require('../package.json').wx.upload
const { appid } = require('../project.config.json')

const project = new ci.Project({
  appid,
  type: 'miniProgram',
  projectPath: process.cwd(),
  // NOTE: 要想使用ci功能需要去后台寻找私钥并置放到本目录下
  privateKeyPath: process.cwd() + `/scripts/private.${appid}.key`,
  ignores: ['node_modules/**/*'],
})

const setting = {
  minify: true,
  es6: true,
  autoPrefixWXSS: true,
  minifyWXML: true,
  minifyWXSS: true,
  minifyJS: true,
}

ci.upload({
  project,
  version,
  desc,
  setting,
})
  .then(res => {
    console.log(res)
    console.log('上传成功')
  })
  .catch(error => {
    if (error.errCode == -1) {
      console.log('上传成功')
    }

    console.log(error)
    console.log('上传失败')
    process.exit(-1)
  })
