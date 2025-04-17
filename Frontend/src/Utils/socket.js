// src/utils/socket.js
import { io } from "socket.io-client";
import { base_url } from "../url"; // Ensure this points to your backend URL

const token = localStorage.getItem("token"); // Assuming token is stored here

const socket = io(base_url, {
  auth: {
    token: `Bearer ${token}`,
  },
  transports: ["websocket"], // Use websocket for faster communication
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

export default socket;
