import io from "socket.io-client";
import { api } from "./api";

const socketConnection = io(api);

export default socketConnection;
