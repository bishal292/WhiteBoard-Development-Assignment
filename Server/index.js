import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import setupSocketServer from './socket/socket.js';
import roomRouter from './routes/room.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/rooms',roomRouter);

// DB + start - Socket Server
const server = http.createServer(app);

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/whiteboard';
mongoose.connect(MONGO).then(() => {
  console.log('mongoDB connected');
});
setupSocketServer(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
