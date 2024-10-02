require('dotenv').config()
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create a new Express app
const app = express();
const PORT = process.env.PORT || 3000

app.use(cors());  // Allow connections from other places (like our Flutter app)
app.use(express.json());  // Middleware to parse JSON bodies

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIo(server, {
  cors: {
    origin: '*',  // Allow all domains to connect
    methods: ['GET', 'POST']
  }
});

// Listen for new connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for 'send_message' events from clients
  socket.on('send_message', (data) => {
    const { message, username } = data;
    console.log('Message received from', username, ':', message);

    // Broadcast the message to all other connected users, including username
    io.emit('receive_message', { message, username });
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// GET request route to check server status
app.get('/status', (req, res) => {
  res.json({ status: 'Server is running and healthy' });
});

// POST request route to test message receiving
app.post('/send-message', (req, res) => {
  const { username, message } = req.body;
  console.log('Message received from:', username, '| Message:', message);
  res.json({ status: 'Message received', username, message });
});

// Start the server on port 3000
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
