const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Database pool setup
const db = mysql.createPool({
  host: "localhost",
  user: "wheretoe_couplescafe",
  password: "8gz7JhHU88LtMZwPeuxH",
  database: "wheretoe_couplescafe",
});

io.on("connection", (socket) => {
  socket.on("joinTeam", (teamId) => {
    socket.join(`team_${teamId}`);
  });

  socket.on("sendMessage", async (data) => {
    const { team_id, sender_name, sender_type, message } = data;
    const type = sender_type || "user";

    // Save user message to MySQL database
    if (type === "user") {
      await db.execute(
        "INSERT INTO messages (team_id, sender_type, sender_name, message) VALUES (?, ?, ?, ?)",
        [team_id, type, sender_name, message],
      );
    }

    // Broadcast message to everyone in the couple's room
    io.to(`team_${team_id}`).emit("receiveMessage", {
      sender_name,
      sender_type: type,
      message,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Cafe server listening on port ${PORT}...`);
});
