const express = require('express');
const {generateMessage,generateLocation} = require("./utils/messages");

const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { addUser,removeUser, getUser, getUsersInRoom} = require("./utils/users")
const publicDirectoryPath = path.join(__dirname, "../public");

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));


io.on('connection', (socket) => {
  
console.log("new socket connection");
  socket.on("join",({username,room},cb)=>{
   
    const {error,user} = addUser({id:socket.id,username,room})

    if(error){
      return cb(error)
   }
    socket.join(user.room);

    socket.emit("message",generateMessage(`Admin`,"Welcome"));
    socket.broadcast.to(user.room).emit("message",generateMessage(`${user.username} has joined`));
    io.to(user.room).emit("roomdata",{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
  })

  socket.on("messageSend", (message,callback) => {
     
    const user = getUser(socket.id)
      io.to(user.room).emit("message",generateMessage(user.username,message));
      callback();
  });

  socket.on("location", (location,cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit("locationmessage",
    generateLocation(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`));
    cb("location sent successfully")
  })

  socket.on("disconnect", () =>{
    const user = removeUser(socket.id);

    if(user){
      io.to(user.room).emit("message",generateMessage(user.username,"has disconnected"));
      io.to(user.room).emit("roomdata",{
        room: user.room,
        users:getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log('listening on *: '+port);
});
