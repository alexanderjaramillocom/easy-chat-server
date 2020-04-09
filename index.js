"use strict";

const chatManager = {
  callbacks: {
    userConnected: [],
    userDisconnected: [],
  },
  subscribe: {
    userConnected: cb => chatManager.callbacks.userConnected.push(cb),
    userDisconnected: cb => chatManager.callbacks.userDisconnected.push(cb)
  }
};

const notify = {
  userConnected: (msg) => 
    chatManager.callbacks.userConnected.forEach(cb => cb(msg)),
  userDisconnected: (msg) => 
    chatManager.callbacks.userDisconnected.forEach(cb => cb(msg)),
}

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
