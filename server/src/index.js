/* eslint-disable no-console */
import app from './app.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('joinList', (listId) => {
    const roomName = `list-${listId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });

  socket.on('leaveList', (listId) => {
    const roomName = `list-${listId}`;
    socket.leave(roomName);
    console.log(`Socket ${socket.id} left room: ${roomName}`);
  });

  socket.on('todoCreated', (data) => {
    // broadcast only to users in the specific list room
    const roomName = `list-${data.list_id}`;
    socket.to(roomName).emit('todoCreated', data);
    console.log(`Todo created: ${data.id} in list: ${data.list_id}`);
  });

  socket.on('todoUpdated', (data) => {
    // broadcast only to users in the specific list room
    const roomName = `list-${data.list_id}`;
    socket.to(roomName).emit('todoUpdated', data);
    console.log(`Todo updated: ${data.id} in list: ${data.list_id}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} Reason: ${reason}`);
  });
});

const port = 4000;
server.listen(port, () => console.log(`Server running on ${port}`));

export default server;
