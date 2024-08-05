import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import io from "socket.io-client";

import "./App.css";

import Forms from "./components/Forms";
import RoomPage from "./pages/RoomPage";

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [peers, setPeers] = useState({});
  const [myPeer, setMyPeer] = useState(null);
  const [openVideo, setOpenVideo] = useState(true);

  const videoGrid = useRef(null);

  const addVideoStream = (div, video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    div.append(video);
    videoGrid.current.append(div);
  };

  const connectToNewUser = (userId, name, stream) => {
    console.log(myPeer, stream);
    const call = myPeer.call(userId, stream);
    console.log("call", call);
    const div = document.createElement("div");
    div.id = userId;
    const video = document.createElement("video");
    const p = document.createElement("p");
    console.log(users);
    p.innerText = name;
    div.append(p);
    call.on("stream", (userVideoStream) => {
      addVideoStream(div, video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    setPeers((prevPeers) => {
      return { ...prevPeers, [userId]: call };
    });
  };

  useEffect(() => {
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        console.log("userJoined");
        setUsers(data.users);
      } else {
        console.log("userJoined error");
      }
    });

    socket.on("allUsers", (data) => {
      setUsers(data);
    });

    socket.on("userLeftMessageBroadcasted", (data) => {
      console.log(`${data.name} ${data.userId} left the room`);
      toast.info(`${data.name} left the room`);
      if (peers[data.userId]) peers[data.userId].close();
    });
  }, []);

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };

  return (
    <div className="container">
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <Forms
              uuid={uuid}
              setMyPeer={setMyPeer}
              socket={socket}
              setUser={setUser}
            />
          }
        />
        <Route
          path="/:roomId"
          element={
            <>
<button
  onClick={() => setOpenVideo(!openVideo)}
  style={{
    position: "absolute",
    top: "30px",
    right: "40px",
    height: "50px", 
    width: "120px", 
    background: "linear-gradient(135deg, #ff6f61, #de2d7f)",
    border: "2px solid #ff6f61", 
    borderRadius: "50px", 
    color: "#ffffff", 
    fontSize: "16px", 
    fontWeight: "700", 
    textAlign: "center",
    lineHeight: "50px", 
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)", 
    cursor: "pointer",
    transition: "all 0.3s ease-in-out", 
    outline: "none",
    textTransform: "uppercase",
    letterSpacing: "1px", 
    padding: "0 20px", 
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.4)";
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.background = "linear-gradient(135deg, #de2d7f, #ff6f61)";
    e.currentTarget.style.borderColor = "#de2d7f";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.background = "linear-gradient(135deg, #ff6f61, #de2d7f)"; 
    e.currentTarget.style.borderColor = "#ff6f61"; r
  }}
>
  Video
</button>

<div
  className="video-grid h-100 position-fixed top-0 d-flex flex-column align-items-start p-3"
  style={{
    zIndex: 1000,
    right: openVideo ? "0" : "-100%",
    transition: "right 0.4s ease, transform 0.3s ease",

    borderRadius: "0 0 0 10px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)", 
  }}
  ref={videoGrid}
>
  <button
    className="btn-close"
    onClick={() => setOpenVideo(false)}
    style={{
      backgroundColor: "#000",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      transition: "background-color 0.3s ease, transform 0.2s ease",
      cursor: "pointer",
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#000"}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#000"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      className="bi bi-x"
      viewBox="0 0 16 16"
      style={{ cursor: "pointer" }}
    >
      <path
        d="M4.293 4.293a1 1 0 0 1 1.414 0L8 5.586l2.293-1.293a1 1 0 1 1 1.414 1.414L9.414 7l2.293 2.293a1 1 0 1 1-1.414 1.414L8 8.414l-2.293 2.293a1 1 0 1 1-1.414-1.414L6.586 8 4.293 5.707a1 1 0 0 1 0-1.414z"
      />
    </svg>
  </button>
</div>

              <RoomPage
                connectToNewUser={connectToNewUser}
                addVideoStream={addVideoStream}
                videoGrid={videoGrid}
                user={user}
                myPeer={myPeer}
                setPeers={setPeers}
                socket={socket}
                users={users}
                setUsers={setUsers}
              />
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
