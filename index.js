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
  }, {}),
  users: {}
};

module.exports = (http) => {
  const io = require("socket.io")(http);

  io.on("connection", (socket) => {
    
    notify.userConnected(socket.id);

    emit(socket, {id: socket.id, payload: ['nickname']}, "who are you?");
    socket.on("I am", ({nickname, id}) => {
      chatManager.users[id] = {nickname, messages: []};
      broadcastEmit(`${nickname} has logged`)
    });

    socket.on("disconnect", () => {
      notify.userDisconnected(socket.id);
    });
    socket.on("public message", (msg) => {
      console.log("message: " + msg);
      emit(socket, msg);
    });
  });

  const emit = (socket, msg, type = "public message") => {
    console.log("emit -> socket, msg", socket.id, msg);
    socket.emit(type, msg);
  };

  const broadcastEmit = (msg, type = "public message") => {
    console.log("broadcastEmit -> msg", msg);
    io.emit(type, msg);
  };

  return {...chatManager, io};
};
