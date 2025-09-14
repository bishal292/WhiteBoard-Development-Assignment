import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Toolbar from "./Toolbar";
import DrawingCanvas from "./DrawingCanvas.jsx";
import UserCursors from "./UserCursors.jsx";

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL || "/";

export default function Whiteboard() {
  const [socket, setSocket] = useState(null);
  const { roomId } = useParams();
  const [usersCount, setUsersCount] = useState(1);
  const [tool, setTool] = useState("pencil");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [color, setColor] = useState("#000000");
  const [clearSignal, setClearSignal] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState({});

  useEffect(() => {
    (async () => {
      if (!roomId) return;
      const response = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/api/rooms/${roomId}`
      );
      if (!response.ok) {
        alert("Room does not exist. Please check the Room ID.");
        window.location.href = "/";
        return;
      }
    })();
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to socket server with id:", s.id);
    });
    s.on("error", (msg) => {
      alert(msg);
      window.location.href = "/";
    });
    s.on("presence-update", ({ count }) => {
      setUsersCount(count);
    });

    s.on("cursor-move", ({ socketId, x, y }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [socketId]: { x, y, lastSeen: Date.now() },
      }));
    });

    s.on("clear-canvas", () => {
      setClearSignal(true);
      setTimeout(() => setClearSignal(false), 100);
    });

    s.emit("join-room", { roomId, color, strokeWidth, tool });
    return () => {
      s.emit("leave-room", { roomId }, () => {
        s.disconnect();
      });
    };
  }, [roomId]);

  if (!socket)
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="text-3xl">Connecting...</div>
      </div>
    );

  const leaveRoom = () => {
    if (socket?.connected) {
      socket.emit("leave-room", { roomId }, (response) => {
        if (response.status === "ok") {
          window.location.href = "/";
        }
      });
    }
  };

  const handleClear = () => {
    setClearSignal(true);
    setTimeout(() => setClearSignal(false), 100);
    if (socket) socket.emit("clear-canvas");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 bg-gray-200 flex justify-between">
        <div>Room: {roomId}</div>
        <button
          className="bg-red-400 hover:bg-rose-600 cursor-pointer text-white px-4 py-2 rounded"
          onClick={leaveRoom}
        >
          Leave Room
        </button>
        <div>
          Active Users: <span className="font-bold">{usersCount}</span>
        </div>
      </div>

      <div className="flex flex-col relative">
        <Toolbar
          tool={tool}
          setTool={setTool}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          color={color}
          setColor={setColor}
          onClear={handleClear}
        />
        <DrawingCanvas
          socket={socket}
          // remoteCursors={remoteCursors}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          clearSignal={clearSignal}
        />
        <UserCursors remoteCursors={remoteCursors} />
      </div>
    </div>
  );
}
