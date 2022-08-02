import { isUndefined } from './helpers'

let memory = {}

wx.memory = {
  get(key, defaultValue) {
    return isUndefined(memory[key]) ? (isUndefined(defaultValue) ? null : defaultValue) : memory[key]
  },
  // 只获取一次并清除
  once(key, defaultValue) {
    const value = this.get(key, defaultValue)
    delete memory[key]

    return value
  },
  set(key, value) {
    if (typeof key === 'string') {
      memory[key] = value
    } else {
      Object.assign(memory, ...arguments)
    }
  },
  remove(key) {
    memory[key] = undefined
    delete memory[key]
  },
  clear() {
    memory = {}
  },
}
