import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomJoin = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    const refinedRoomId = roomId.trim();
    const roomIdPattern = /^[a-zA-Z0-9]{3,20}$/;
    if (
      refinedRoomId.length < 6 ||
      refinedRoomId.length > 8 ||
      !roomIdPattern.test(refinedRoomId)
    ) {
      alert(
        "Room ID must be between 6 and 8 characters long and must contain only alphanumeric characters."
      );
      return;
    }
    fetch(`${import.meta.env.VITE_APP_BASE_URL}/api/rooms/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: refinedRoomId }),
    })
      .then((res) => {
        if (res.ok) {
          console.log("Room joined or created successfully");
        } else {
          console.error("Failed to join or create room");
        }
        res.json().then((data) => console.log(data));
        navigate(`/room/${refinedRoomId}`);
      })
      .catch((err) => {
        alert("Error connecting to server. Please try again later.");
        console.error("Error:", err);
      });
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="max-w-md p-8 border border-gray-300 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl text-gray-800 font-bold">Join a Room</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom()
          }}
        >
          <input
            type="text"
            className="border border-gray-300 p-2 rounded-lg w-full mt-4"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            className="border border-gray-300 p-2 bg-gray-200 rounded-lg mt-4 hover:cursor-pointer hover:bg-gray-600 hover:text-white w-full"
            type="submit"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomJoin;
