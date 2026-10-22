const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("joinTeam", (teamId) => {
    socket.join(`team_${teamId}`);
  });

  // Pure signaling/broadcasting - no database code needed here!
  socket.on("sendMessage", (data) => {
    const { team_id, sender_name, sender_type, message } = data;

    // Broadcast to everyone in the couple's room instantly
    io.to(`team_${team_id}`).emit("receiveMessage", {
      sender_name,
      sender_type: sender_type || "user",
      message,
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});
