import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

app.use(morgan("dev"));
app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

// // 500 (Internal Server Errors)
app.use((error, req, res, next) => {
  return res.status(500).json({ message: error.message });
});

server.listen(PORT, () => {
  console.log("Server listen on PORT: ", PORT);
  connectDB();
});
