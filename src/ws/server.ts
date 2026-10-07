import { Express } from "express";
import { Server, WebSocket, WebSocketServer } from "ws";
import { Match } from "../db/schema";
import http from "http";

const matchSubscribers = new Map<number, Set<WebSocket>>();

function subscribe(matchId: number, socket: WebSocket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId)?.add(socket);
}

function unsubscribe(matchId: number, socket: WebSocket) {
  const subscribers = matchSubscribers.get(matchId);

  if (!subscribers) return;

  subscribers.delete(socket);

  if (subscribers.size === 0) {
    matchSubscribers.delete(matchId);
  }
}

function cleanupSubscriptions(socket: WebSocket) {
  for (const matchId of socket.subscriptions) {
    unsubscribe(matchId, socket);
  }
}

function broadcastToMatch(matchId: number, payload: unknown) {
  const subscribers = matchSubscribers.get(matchId);

  if (!subscribers || subscribers.size === 0) return;

  const message = JSON.stringify(payload);

  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function handleMessage(socket: WebSocket, data: Record<string, unknown>) {
  let message;

  try {
    message = JSON.parse(data.toString());
  } catch {
    sendJSON(socket, { type: "error", message: "Invalid JSON" });
  }

  if (
    message?.type === "subscribe" &&
    "matchId" in message &&
    Number.isInteger(message.matchId)
  ) {
    subscribe(message.mathcId, socket);
    socket.subscriptions.add(message.matchId);
    sendJSON(socket, { type: "subscribed", matchId: message.matchId });
    return;
  }

  if (
    message?.type === "unsubscribe" &&
    "matchId" in message &&
    Number.isInteger(message.matchId)
  ) {
    unsubscribe(message.matchId, socket);
    socket.subscriptions.delete(message.matchId);
    sendJSON(socket, { type: "unsubscribed", matchId: message.matchId });
  }
}

function sendJSON(socket: WebSocket, payload: unknown) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: unknown) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket: WebSocket) => {
    socket.subscriptions = new Set();

    sendJSON(socket, { type: "welcome" });

    socket.on("message", (data: Record<string, unknown>) => {
      handleMessage(socket, data);
    });

    socket.on("close", () => {
      cleanupSubscriptions(socket);
    });

    socket.on("error", () => {
      socket.terminate();
    });

    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  function broadcastMatchCreated(match: Match) {
    broadcast(wss, { type: "match_created", data: match });
  }

  function broadcastCommentary(matchId: number, comment: string) {
    broadcastToMatch(matchId, { type: "commentary", data: comment });
  }

  return { broadcastMatchCreated, broadcastCommentary };
}
