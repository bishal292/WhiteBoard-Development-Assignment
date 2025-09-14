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

    socket.on("join-room", async ({ roomId, color, strokeWidth, tool }) => {
      if (!roomId) {
        socket.emit("error", "Room ID is required to join a room");
        return;
      }
      const room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }
      if (!color) color = "#000000";
      if (!strokeWidth) strokeWidth = 2;
      if (!tool) tool = "pencil";
      socket.join(roomId);
      roomsMeta[roomId] = roomsMeta[roomId] || { users: {} }; // initialize the room if it is not aplready present with an empty users object.
      roomsMeta[roomId].users[socket.id] = { color, strokeWidth, tool };

      // Send current drawing data to the newly joined User
      socket.emit("drawing-data", room.drawingData || []);

      io.to(roomId).emit("presence-update", {
        count: Object.keys(roomsMeta[roomId].users).length,
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

    // --- SOCKET EVENTS FOR WHITEBOARD COLLABORATION ---

    // Cursor position update
    socket.on("cursor-move", ({ x, y }) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      rooms.forEach((roomId) => {
        socket.to(roomId).emit("cursor-move", {
          socketId: socket.id,
          x,
          y,
        });
      });
    });

    // Drawing events
    socket.on("draw-start", async ({ x, y, color, strokeWidth, tool }) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        // Save to DB
        await Room.updateOne(
          { roomId },
          {
            $push: {
              drawingData: {
                type: "stroke-start",
                data: { socketId: socket.id, x, y, color, strokeWidth, tool },
              },
            },
            $set: { lastActivity: new Date() },
          }
        );
        socket.to(roomId).emit("draw-start", {
          socketId: socket.id,
          x,
          y,
          color,
          strokeWidth,
          tool,
        });
      }
    });

    socket.on("draw-move", async ({ x, y }) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        await Room.updateOne(
          { roomId },
          {
            $push: {
              drawingData: {
                type: "stroke-move",
                data: { socketId: socket.id, x, y },
              },
            },
            $set: { lastActivity: new Date() },
          }
        );
        socket.to(roomId).emit("draw-move", {
          socketId: socket.id,
          x,
          y,
        });
      }
    });

    socket.on("draw-end", async () => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        await Room.updateOne(
          { roomId },
          {
            $push: {
              drawingData: {
                type: "stroke-end",
                data: { socketId: socket.id },
              },
            },
            $set: { lastActivity: new Date() },
          }
        );
        socket.to(roomId).emit("draw-end", {
          socketId: socket.id,
        });
      }
    });

    // Clear canvas event
    socket.on("clear-canvas", async () => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        await Room.updateOne(
          { roomId },
          {
            $push: {
              drawingData: {
                type: "clear",
                data: { socketId: socket.id },
              },
            },
            $set: { lastActivity: new Date() },
          }
        );
        io.to(roomId).emit("clear-canvas");
      }
    });

    socket.on("disconnect", () => {
      // Remove the disconnected user from all the room they have joined previously.
      for (const roomId in roomsMeta) {
        if (roomsMeta[roomId].users[socket.id]) {
          leaveRoom(roomId);
        }
      }
    });
  });
};

export default setupSocketServer;
