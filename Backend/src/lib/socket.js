import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Used to store online users
const socketUsersMap = {};

function getReceiverSocketId(userId){
  return socketUsersMap[userId];
}

io.on("connection", (socket) => {
  console.log("A User Connected: ", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) socketUsersMap[userId] = socket.id;

  // This method is used to send event to all the connected users
  io.emit("getOnlineUsers", Object.keys(socketUsersMap));

  socket.on("disconnect", () => {
    console.log("A User Disconnected: ", socket.id);
    delete socketUsersMap[userId];
    io.emit("getOnlineUsers", Object.keys(socketUsersMap));
  });
});
export { io, app, server, getReceiverSocketId };
