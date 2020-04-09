"use strict";

/** *********************************************************
 * Manageable events
 */
const events = ['userConnected', 'userDisconnected'];

/** *********************************************************
 * Callback array for each event
 */
const callbacks = events.reduce((obj, event) => {
  /* callbacks.userConnected: [] */
  obj[event] = [];
  return obj;
}, {});

/** *********************************************************
 * Notify each callback for an event
 */
const notify = events.reduce((obj, event) => {
  /**
    notify.userConnected: (msg) => 
      callbacks.userConnected.forEach(cb => cb(msg)),
   */
  obj[event] = (msg) => 
    callbacks[event].forEach(cb => cb(msg));
  return obj;
}, {});

/**
 * All methods and variables manageable from library
 */
const chatManager = {
  events,
  subscribe: events.reduce((obj, event) => {
    /* subscribe.userConnected: cb => callbacks.userConnected.push(cb) */
    obj[event] = cb => callbacks[event].push(cb);
    return obj;
  }, {})
};

module.exports = (http) => {
  const io = require("socket.io")(http);

  io.on("connection", (socket) => {
    
    notify.userConnected(socket.id);
    socket.on("disconnect", () => {
      notify.userDisconnected(socket.id);
    });
    socket.on("chat message", (msg) => {
      console.log("message: " + msg);
      emit(socket, msg);
      broadcastEmit("hi to everyone");
    });
  });

  const emit = (socket, msg) => {
    console.log("emit -> socket, msg", socket.id, msg);
    socket.emit("chat message", msg);
  };

  const broadcastEmit = (msg) => {
    console.log("broadcastEmit -> msg", msg);
    io.emit("chat message", msg);
  };

  return {...chatManager, io};
};
