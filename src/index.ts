import express from "express";
import { matchRouter } from "./routes/matches";
import { config } from "dotenv";
import http from "http";
import { attachWebSocketServer } from "./ws/server";
import logger from "./config/logger";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookierParser from "cookie-parser";

config();

const PORT = (process.env.PORT || 8000) as unknown as number;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookierParser());

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

const server = http.createServer(app);

app.get("/", (req, res) => {
  logger.info("Hello from Sports Dashboard!");
  res.status(200).send("Hello from Sports Dashboard!");
});

app.use("/matches", matchRouter);

const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, undefined, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running at localhost: ${baseUrl}`);
  console.log(
    `Websocket Server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
