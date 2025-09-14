# WorkElate Collaborative Whiteboard

A real-time collaborative whiteboard built with React, Vite, Node.js, Express, Socket.IO, and MongoDB.

watch working demo video of the project [here](demo.mp4)
---

## 1. Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### Clone the Repository

```bash
git clone https://github.com/bishal292/WhiteBoard-Development-Assignment.git
cd WhiteBoard-Development-Assignment
```

### Environment Variables

Create a `.env` or rename `.env.example` to `.env` in `Client/` and add these variables:

```env
VITE_APP_SOCKET_URL
VITE_APP_BASE_URL
```

### Install Dependencies

Navigate to both the `Client` and `Server` directories and install the dependencies:

```bash
cd Client
npm install

cd ../Server
npm install
```

### Development Scripts

To run the development servers:

```bash
# In one terminal, start the Server(requres nodemon)
cd Server
npm run dev

# In another terminal, start the Client
cd Client
npm run dev
```

### Building for Production

To build the client for production, run:

```bash
cd Client
npm run build
```

This will create an optimized build of the app in the `Client/dist` directory.

---

## 2. Features

- Real-time collaboration with multiple users
- User presence indication

---

## 3. Architecture Overview

### High-Level System Design

**1. Client (Frontend)**
- Built with React and Vite.
- Connects to the backend via REST API for room management and via Socket.IO for real-time collaboration.
- Handles user interactions, drawing, and displays remote users' cursors and strokes in real time.

**2. Server (Backend)**
- Node.js with Express for REST API endpoints.
- Socket.IO for real-time, bidirectional communication.
- Handles room creation, user presence, drawing events, and broadcasts updates to all connected clients in a room.
- Persists drawing data and room metadata.

**3. Database (MongoDB)**
- Stores room information and the full drawing history (`drawingData`) for each room.
- Allows new users to receive the current state of the whiteboard when joining a room.

**4. Data Flow**
- **Room Join:**  
  - Client requests to join a room via REST.
  - On success, connects to Socket.IO and emits `join-room`.
- **Drawing:**  
  - User actions (draw, move, end, clear) are emitted via Socket.IO.
  - Server broadcasts these events to all other users in the room and saves them to MongoDB.
- **Cursor Movement:**  
  - Cursor positions are sent in real time and displayed for all users.
- **Persistence:**  
  - All drawing actions are saved in the database, so new users see the current whiteboard state.

**5. Deployment**
- The client can be built and served as static files by the backend server.
- The server and database can be deployed on any cloud or VPS provider.

**Diagram:**

```
+---------+        REST/Socket.IO        +---------+        MongoDB
|  Client |  <----------------------->  | Server  |  <----> Database
+---------+                             +---------+
      ^                                     ^
      |<--- Real-time drawing/cursor ------>|
```

---

## 4. Folder Structure

```
WorkElate/
├── Client/                # Frontend code
│   ├── public/            # Static assets
│   ├── src/               # React components
│   ├── App.jsx            # Main React component
│   ├── index.jsx          # Entry point
│   └── vite.config.js     # Vite configuration
└── Server/                # Backend code
    ├── config/            # Configuration files
    ├── controllers/       # Request handlers
    ├── models/            # MongoDB models
    ├── routes/            # Express routes
    ├── utils/             # Utility functions
    ├── app.js             # Express app setup
    └── server.js          # Entry point
```

---

## 5. API Endpoints

| Method | Endpoint           | Description                                                                    |
| ------ | ------------------ | ------------------------------------------------------------------------------ |
| POST   | /api/rooms/join    | Creates a new room or join an existing if exists, requires roomId in the body. |
| GET    | /api/rooms/:roomId | Joins a specific Room If it is Available, requires roomId as params            |

### Example Server Responses

#### `POST /api/rooms/join`

**Request Body:**
```json
{
  "roomId": "ABC123"
}
```

**Success Response:**
```json
{
  "roomId": "ABC123",
  "createdAt": "2024-05-01T12:00:00.000Z",
  "lastActivity": "2024-05-01T12:00:00.000Z"
}
```

**Error Response (missing/invalid roomId):**
```json
{
  "error": "roomId required"
}
```
or
```json
{
  "msg": "invalid roomId"
}
```

---

#### `GET /api/rooms/:roomId`

**Success Response:**
```json
{
  "_id": "6631e6d8f1b2c2a1b2c3d4e5",
  "roomId": "ABC123",
  "createdAt": "2024-05-01T12:00:00.000Z",
  "lastActivity": "2024-05-01T12:00:00.000Z",
  "drawingData": [
    {
      "type": "stroke-start",
      "data": { "socketId": "abcd1234", "x": 100, "y": 200, "color": "#000000", "strokeWidth": 2, "tool": "pencil" },
      "timestamp": "2024-05-01T12:01:00.000Z"
    },
    {
      "type": "stroke-move",
      "data": { "socketId": "abcd1234", "x": 110, "y": 210 },
      "timestamp": "2024-05-01T12:01:01.000Z"
    }
    // ...more drawing commands
  ],
  "__v": 0
}
```

**Error Response (room not found):**
```json
{
  "msg": "not found"
}
```

---

## 6. Socket.IO Events

| Event        | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| join-room    | When a new user join a room                                              |
| leave-room   | When a user leaves a room                                                |
| cursor-move  | When the cursor is moved around the board/canvas                         |
| draw-start   | When a user starts to draw something                                     |
| draw-end     | When a user stops drawing on the canvas or complete the previous drawing |
| clear-canvas | when a user want to clean the canvas and click on clear canvas button    |

---

## 7. Development Tools

- **Code Quality:** ESLint, Prettier
- **Version Control:** Git

---

## 8. Testing

To run tests, navigate to the `Client` or `Server` directory and run:

```bash
npm test
```

---

## 9. Troubleshooting

- **Common Issues:**

  - If you encounter issues, check the console for error messages.
  - Ensure all environment variables are set correctly.
  - Make sure MongoDB is running if you're using a local instance.

- **FAQs:**
  - **Q:** How do I reset the database?
    - 
    **A:** You can reset the database by dropping the existing database and creating a new one. Be careful, this will delete all data.
  - **Q:** How do I change the port?
    -
    **A:** You can change the port by modifying the variables in the `.env` file you can have a look of the variables being used in the application by visiting `.env.example` file.

---

## 10. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 11. Acknowledgments

- Inspired by other collaborative tools
- Built using the MERN stack with Socket.IO for real-time communication
