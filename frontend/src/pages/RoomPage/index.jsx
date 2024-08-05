import { useState, useRef, useEffect } from "react";

import "./index.css";

import WhiteBoard from "../../components/Whiteboard";
import Chat from "../../components/ChatBar";
import { toast } from "react-toastify";

const RoomPage = ({
  user,
  socket,
  users,
  videoGrid,
  setUsers,
  myPeer,
  setPeers,
  connectToNewUser,
  addVideoStream,
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [openedChatTab, setOpenedChatTab] = useState(false);
  const [stream, setStream] = useState(null);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillRect = "white";
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
  };

  const undo = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1],
    ]);
    setElements((prevElements) =>
      prevElements.slice(0, prevElements.length -1)
    );
  };

  const redo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

  const adduserIdInP = async (p, call, div, video) => {
    p.innerText = "Other User";
    div.append(p);
    call.on("stream", (userVideoStream) => {
      addVideoStream(div, video, userVideoStream);
    });
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setStream(stream);
        const div = document.createElement("div");
        div.id = user.userId;
        const p = document.createElement("p");
        p.innerText = user.name;
        div.append(p);
        const myVideo = document.createElement("video");

        addVideoStream(div, myVideo, stream);

        myPeer.on("call", (call) => {
          console.log("call", call);

          call.answer(stream);
          const div = document.createElement("div");
          div.id = call.peer;
          const video = document.createElement("video");
          const p = document.createElement("p");
          adduserIdInP(p, call, div, video);
        });
      });
  }, []);

  useEffect(() => {
    socket.on("userJoinedMessageBroadcasted", (data) => {
      setUsers(data.users);
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          console.log(`${data.name} ${data.userId} joined the room`);
          toast.info(`${data.name} joined the room`);
          console.log("working");
          connectToNewUser(data.userId, data.name, stream);
          console.log("working");
        });
    });
  }, []);

  return (
    <div className="row">
      <button
        type="button"
        className="btn btn-dark"
        style={{
          display: "block",
          position: "absolute",
          top: "30px",
          left: "3%",
          height: "50px",
          width: "120px",
          background: "linear-gradient(135deg, #6a11cb, #2575fc)",
          border: "none",
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
        onClick={() => setOpenedUserTab(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.4)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Users
      </button>

      <button
        type="button"
        className="btn btn-primary"
        style={{
          display: "block",
          position: "absolute",
          top: "30px",
          left: "12%",
          height: "50px",
          width: "120px",
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          border: "none",
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
        onClick={() => setOpenedChatTab(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.4)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Chats
      </button>

      {openedUserTab && (
        <div
          className="position-fixed top-0 h-100 text-white bg-dark"
          style={{ width: "250px", left: "0%" }}
        >
          <button
            type="button"
            onClick={() => setOpenedUserTab(false)}
            className="btn-custom"
          >
            Close
          </button>
          <div className="user-list-container">
            {users.map((usr, index) => (
              <p key={index * 999} className="user-item ">
                {usr.name}{" "}
                {user && user.userId === usr.userId && (
                  <span className="you-label">(You)</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
      {openedChatTab && (
        <Chat setOpenedChatTab={setOpenedChatTab} socket={socket} />
      )}
      <h1 className="text-center py-4 heading-style">
        Vision Board{" "}
        <span className="text-gradient">[Users Online: {users.length}]</span>
      </h1>

      {user?.presenter && (
        <div className="col-md-10 mx-auto px-5 mb-3 d-flex align-items-center jusitfy-content-center">
        <div className="tool-selector d-flex col-md-2 justify-content-center gap-2">
  <div className="tool-option d-flex gap-2 align-items-center">
    <input
      type="radio"
      name="tool"
      id="pencil"
      checked={tool === "pencil"}
      value="pencil"
      className="tool-radio"
      onChange={(e) => setTool(e.target.value)}
    />
    <label htmlFor="pencil" className="tool-label">
      Pencil
    </label>
  </div>
  <div className="tool-option d-flex gap-2 align-items-center">
    <input
      type="radio"
      name="tool"
      id="line"
      value="line"
      checked={tool === "line"}
      className="tool-radio"
      onChange={(e) => setTool(e.target.value)}
    />
    <label htmlFor="line" className="tool-label">
      Line
    </label>
  </div>
  <div className="tool-option d-flex gap-2 align-items-center">
    <input
      type="radio"
      name="tool"
      id="rect"
      checked={tool === "rect"}
      value="rect"
      className="tool-radio"
      onChange={(e) => setTool(e.target.value)}
    />
    <label htmlFor="rect" className="tool-label">
      Rectangle
    </label>
  </div>
</div>

          <div className="color-picker-container col-md-3 mx-auto">
            <div className="d-flex align-items-center justify-content-center">
              <label htmlFor="color" className="color-picker-label">
                Select Color:
              </label>
              <input
                type="color"
                id="color"
                className="color-picker-input mt-1 ms-3"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button
              className="btn-undo"
              disabled={elements.length === 1}
              onClick={() => undo()}
            >
              Undo
            </button>
            <button
              className="btn-redo"
              disabled={history.length < 1}
              onClick={() => redo()}
            >
              Redo
            </button>
          </div>
          <div className="col-md-2">
            <button className="btn-clear-canvas" onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>
        </div>
      )}

      <div className="col-md-10 mx-auto mt-4 canvas-box">
        <WhiteBoard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          color={color}
          tool={tool}
          user={user}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default RoomPage;
