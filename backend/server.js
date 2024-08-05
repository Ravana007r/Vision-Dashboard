const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { Server } = require("socket.io");
const { PeerServer } = require("peer");

// Load SSL certificate and key
const privateKey = fs.readFileSync(path.join(__dirname, 'path/to/your/private-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'path/to/your/certificate.pem'), 'utf8');
const ca = fs.readFileSync(path.join(__dirname, 'path/to/your/ca-certificate.pem'), 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

const app = express();

// Create an HTTPS server with the credentials
const server = https.createServer(credentials, app);

// Initialize PeerJS server
const peerServer = PeerServer({
  port: 443, // Use the default port for HTTPS
  path: '/peerjs',
  secure: true, // Use HTTPS
  ssl: credentials // Pass the SSL credentials
});
app.use('/peerjs', peerServer);

const io = new Server(server);

// routes
app.get("/", (req, res) => {
  res.send(
    "This is the MERN realtime board sharing app official server by FullyWorld Web Tutorials"
  );
});

let roomIdGlobal, imgURLGlobal;

io.on("connection", (socket) => {
  socket.on("userJoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    const users = addUser({
      name,
      userId,
      roomId,
      host,
      presenter,
      socketId: socket.id,
    });
    socket.emit("userIsJoined", { success: true, users });
    console.log({ name, userId });
    socket.broadcast.to(roomId).emit("allUsers", users);
    setTimeout(() => {
      socket.broadcast
        .to(roomId)
        .emit("userJoinedMessageBroadcasted", { name, userId, users });
      socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
        imgURL: imgURLGlobal,
      });
    }, 1000);
  });

  socket.on("whiteboardData", (data) => {
    imgURLGlobal = data;
    socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse", {
      imgURL: data,
    });
  });

  socket.on("message", (data) => {
    const { message } = data;
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast
        .to(roomIdGlobal)
        .emit("messageResponse", { message, name: user.name });
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", {
        name: user.name,
        userId: user.userId,
      });
    }
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () =>
  console.log(`Server is running on https://localhost:${port}`)
);
