import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Toolbar from "./Toolbar";
import DrawingCanvas from "./DrawingCanvas.jsx";
import UserCursors from "./UserCursors.jsx";

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL || "/";

export default function Whiteboard() {
  const [socket,setSocket] = useState(null);
  const { roomId } = useParams();
  const [usersCount, setUsersCount] = useState(1);

  useEffect(() => {
    (async () => {
      if (!roomId) return;
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/api/rooms/${roomId}`);
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
    s.on("presence-update", ({ count, users }) => {
      setUsersCount(count);
      console.log("Active users in room:", count, users);
    });

    s.emit("join-room", { roomId });
    return () => {
      s.emit("leave-room", { roomId },()=>{
        s.disconnect();
      });
    };
  }, [roomId]);


  if (!socket) return <div className="w-screen h-screen flex justify-center items-center">
    <div className="text-3xl" >Connecting...</div>
    </div>;

  const leaveRoom = () => {
    if (socket?.connected) {
      socket.emit("leave-room", { roomId },(response)=>{
        if(response.status === "ok"){
          window.location.href = "/";
        }
      })
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
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

      <div>
        <Toolbar />
        <DrawingCanvas />
        <UserCursors />
      </div>
    </div>
  );
}
