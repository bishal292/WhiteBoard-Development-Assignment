import mongoose from "mongoose";

const DrawingCmd = new mongoose.Schema({
  type: { type: String }, // 'stroke-start', 'stroke-move', 'stroke-end', 'clear'
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  drawingData: { type: [DrawingCmd], default: [] }
});

const Room = mongoose.model("Room", RoomSchema);
export default Room;