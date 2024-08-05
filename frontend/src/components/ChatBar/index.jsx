import { useEffect, useState } from "react";
import "./index.css"

const Chat = ({ setOpenedChatTab, socket }) => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("messageResponse", (data) => {
      setChat((prevChats) => [...prevChats, data]);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      setChat((prevChats) => [...prevChats, { message, name: "You" }]);
      socket.emit("message", { message });
      setMessage("");
    }
  };

  return (
    <div
      className="position-fixed top-0 h-100 text-white bg-dark"
      style={{ width: "400px", left: "0%" }}
    >
<button
  type="button"
  onClick={() => setOpenedChatTab(false)}
  className="btn-custom"
>
  Close
</button>

<div
  className="chat-container"
>
  {chat.map((msg, index) => (
    <p
      key={index * 999}
      className="message"
    >
      {msg.name}: {msg.message}
    </p>
  ))}
</div>
<form onSubmit={handleSubmit} className="message-form">
  <input
    type="text"
    placeholder="Enter message"
    className="message-input"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
  />
  <button type="submit" className="send-button">
    Send
  </button>
</form>
</div>
  );
};

export default Chat;