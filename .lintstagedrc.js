module.exports = {
  // 对所有的这几类文件执行检测规则
  '*.{js,jsx,ts,tsx,vue}': ['prettier --write', 'eslint --fix'],
}
