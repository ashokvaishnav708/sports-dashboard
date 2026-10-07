import expres from "express";
import { matchRouter } from "./routes/matches";
import { config } from "dotenv";
import http from "http";
import { attachWebSocketServer } from "./ws/server";

config();

const PORT = (process.env.PORT || 8000) as unknown as number;
const HOST = process.env.HOST || "0.0.0.0";

const app = expres();

const server = http.createServer(app);

app.use(expres.json());

app.get("/", (req, res) => {
  res.send("Hello from Express server!");
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
