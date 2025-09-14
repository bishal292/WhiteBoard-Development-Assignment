import { Router } from "express";
import Room from "../models/Room.js";

const roomRouter = Router();

roomRouter.post("/join", async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).send({ error: "roomId required" });
  const refinedRoomId = roomId.trim();
  const roomIdPattern = /^[a-zA-Z0-9]{6,8}$/;
  if (
    refinedRoomId.length < 6 ||
    refinedRoomId.length > 8 ||
    !roomIdPattern.test(refinedRoomId)
  ) {
    return res.status(400).send({ msg: "invalid roomId" });
  }
  let room = await Room.findOne({ roomId });
  if (!room) {
    room = new Room({
      roomId,
      createdAt: new Date(),
      lastActivity: new Date(),
      drawingData: [],
    });
    await room.save();
  }
  return res.json({
    roomId: room.roomId,
    createdAt: room.createdAt,
    lastActivity: room.lastActivity,
  });
});

roomRouter.get("/:roomId", async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });
  if (!room) return res.status(404).send({ msg: "not found" });
  return res.json(room);
});

export default roomRouter;
