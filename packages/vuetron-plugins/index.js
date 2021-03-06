const io = require('socket.io-client');

const VuetronVue = {
  install (Vue, options = {}) {
    // set socket port to options or 9090 by default
    let { port = 9090 } = options;
    const socket = io('http://localhost:' + port);
    // Monkey patch $emit to be able to return emitted events to server
    Vue.prototype.$emit = (function (original) {
      return function (...cb) {
        let currThis = this;
        // check if event (cb[0]) is a user emitted event
        if (typeof cb[0] === 'string' && !cb[0].includes('hook:')) {
          // socket emit that a user event has been emitted
          socket.emit('clientEmitEvent', cb[0]);
          // find the context that has the correct event
          let temp = Object.getPrototypeOf({});
          Object.setPrototypeOf(currThis._events, temp);
          while (!currThis._events.hasOwnProperty(cb[0]) && this._context !== undefined) {
            currThis = currThis._context;
          }
        }
        original.apply(currThis, cb);
      };
    }(Vue.prototype.$emit));

    function buildObject (component) {
      if (!component || !component.$vnode || !component.$vnode.hasOwnProperty('tag')) return;
      let obj = {};
      obj.name = component.$vnode.tag;
      if (component.hasOwnProperty('$children') && component.$children.length > 0) {
        obj.children = [];
        for (let childComponent of component.$children) {
          obj.children.push(buildObject(childComponent));
        }
      }
      return obj;
    }

    function grabAndEmitDOM () {
      let parents = document.body.children;
      const children = [];
      for (let node of parents) {
        if (node.hasOwnProperty('__vue__') && node.__vue__.hasOwnProperty('$children') && node.__vue__.$children.length > 0) {
          children.push('mounted', node.__vue__.$children[0]);
          const firstComp = node.__vue__.$children[0];
          socket.emit('clientDomTree', buildObject(firstComp));
        }
      }
    }

    Vue.mixin({
      mounted () {
        grabAndEmitDOM();
      },
      destroyed () {
        grabAndEmitDOM();
      }
    });
  }
};

const VuetronVuex = store => {
  // initialize socket connection
  const port = 9090;
  const socket = io('http://localhost:' + port);

  // Immediately emit current state in case Vuetron is started first
  socket.emit('clientStateInit', store.state);

  // listen for initial state request from Vuetron
  socket.on('requestClientState', function () {
    // emit initial state to server
    socket.emit('clientStateInit', store.state);
  });

  // listen for state changes from Vuetron and update
  //  app state accordingly
  socket.on('updateClientState', function (newState) {
    // parse the stringified new state passed from Vuetron
    let parsedState = JSON.parse(newState);
    // replace app's current state with the parsed Vuetron state
    store.replaceState(parsedState);
  });

  // subscribe to store mutations
  store.subscribe((mutation, state) => {
    // on mutation, emit update event to server
    socket.emit('clientStateUpdate', state);
  });
};

module.exports = {
  VuetronVue,
  VuetronVuex
};
