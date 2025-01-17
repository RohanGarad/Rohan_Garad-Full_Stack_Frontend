import { io } from "socket.io-client";

const socket = io("https://rohan-garad-full-stack-backend.onrender.com", {
  transports: ["websocket", "polling"],
});

export default socket; 