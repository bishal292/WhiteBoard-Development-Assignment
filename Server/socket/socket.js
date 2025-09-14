import { Server as SocketIOServer } from "socket.io";
import Room from "../models/Room.js";

const setupSocketServer = (server) => {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  let roomsMeta = {}; // in-memory user counts, cursors if needed
  /*  
    Structure to be followed: 
    {
      roomId: {
        users: {
          socketId: {
            color: string -> HexCode
          }
        }
      }
    }
  */

  io.on("connection", (socket) => {
    console.log("socket connected with id: ", socket.id);

    socket.on("join-room", async ({ roomId }) => {
      const room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }
      socket.join(roomId);
      roomsMeta[roomId] = roomsMeta[roomId] || { users: {} }; // initialize the room if it is not aplready present with an empty users object.
      roomsMeta[roomId].users[socket.id] = { color: "#000" };

      io.to(roomId).emit("presence-update", {
        count: Object.keys(roomsMeta[roomId].users).length,
        users: roomsMeta[roomId].users,
      });
    });

    const leaveRoom = (roomId) => {
      if (!roomId || !roomsMeta[roomId] || !roomsMeta[roomId].users) return;

      delete roomsMeta[roomId].users[socket.id];

      if (Object.keys(roomsMeta[roomId].users).length === 0) {
        delete roomsMeta[roomId];
      } else {
        io.to(roomId).emit("presence-update", {
          count: Object.keys(roomsMeta[roomId].users).length,
          users: roomsMeta[roomId].users,
        });
      }

      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    };

    socket.on("leave-room", ({ roomId }, callback) => {
      console.log("Leave - room is triggered on server.");
      leaveRoom(roomId)
      socket.leave(roomId);
      return callback({
        status: "ok",
      });
    });

    socket.on("disconnect", () => {
      // Remove the disconnected user from all the room they have joined.
      for (const roomId in roomsMeta) {
        if (roomsMeta[roomId].users[socket.id]) {
          leaveRoom(roomId);
        }
      }
    });
  });
};

export default setupSocketServer;
