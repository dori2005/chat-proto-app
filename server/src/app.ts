import connectDB from "@configs/db";
import { errorHandler, notFound } from "@middlewares/errorMiddleware";
import routes from "@routes/index";
import colors from "colors";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import IUserDocument from "./dtos/userDto";
import { useSession } from "./redis/connect-redis";
dotenv.config();
const app = express();

const server = http.createServer(app);

const io = new Server(server, {});
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api", routes);

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "prod") {
  app.use(express.static(path.join(__dirname1, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "../client", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json("dev API server is running");
  });
}
app.use(notFound);
app.use(errorHandler);
io.use((socket, next: unknown) => {
  console.log(socket.request);
  useSession(socket.request, {}, next);
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    socket.emit("connected");
    console.log("connected : " + userData?._id);
  });

  socket.on("error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room : " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
    console.log(colors.yellow(room));
  });
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat user not defined");
    chat.users.forEach((user: IUserDocument) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(colors.yellow(`server listening on port ${PORT}`));
});
