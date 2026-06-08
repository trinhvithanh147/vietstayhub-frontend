import { io } from "socket.io-client";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(apiBaseUrl, {
  autoConnect: false,
  withCredentials: true,
});
