const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  socket.on("join", ({ username, room }) => {
    socket.join(room);

    // io.to.emit
    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined`));
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    io.emit("message", generateMessage(message));
    callback("Message is Delivered to Server");
  });

  socket.on("sendLocation", (message, callback) => {
    io.emit("locationMessage", generateMessage(message));
    callback("Location is Delivered to Server");
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has disconnected");
  });
});

server.listen(port, () => {
  console.log("Listening on Port:" + port);
});
