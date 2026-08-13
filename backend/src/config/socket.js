import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for development/cors handling
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
}

export function broadcastInventoryUpdate(productId, newStock) {
  if (io) {
    console.log(`📡 Broadcasting inventory update: Product ${productId} -> Stock ${newStock}`);
    io.emit('inventory-update', { productId, stock: newStock });
  }
}
