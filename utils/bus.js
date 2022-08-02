class Bus {
  constructor() {
    this.events = {}
  }

  emit(type, ...args) {
    const keys = Object.keys(this.events)
    const [event, namespace] = String(type).split('.')

    const fire = key => {
      const events = this.events[key]

      if (Array.isArray(events)) {
        for (let i = 0; i < events.length; i++) {
          events[i] && events[i].apply(this, args)
        }
      }
    }

    const batchFire = regexp => {
      keys.filter(key => RegExp(regexp).test(key)).forEach(name => fire(name))
    }

    if (event && namespace) {
      fire(type)
    } else if (event) {
      batchFire('^' + event + '(\\.|$)')
    } else {
      batchFire('\\.' + namespace + '$')
    }
  }
  // type: "evnetName.namespace" - "appLogin.HomePage"
  on(type, fun) {
    const e = this.events[type]

    if (!e) {
      this.events[type] = [fun]
    } else {
      e.push(fun)
    }
  }

  off(type) {
    const keys = Object.keys(this.events)
    const [event, namespace] = String(type).split('.')

    const unbind = _type => {
      this.events[_type] = null // undefined
      delete this.events[_type]
    }

    const batchUnbind = regexp => {
      keys.filter(key => RegExp(regexp).test(key)).forEach(name => unbind(name))
    }

    if (typeof type === 'undefined') {
      keys.forEach(unbind)
    } else if (event && namespace) {
      unbind(type)
    } else if (event) {
      batchUnbind('^' + event + '(\\.|$)')
    } else {
      batchUnbind('\\.' + namespace + '$')
    }
  }
}

export default new Bus()
