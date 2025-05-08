const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const env = require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());

// index.html をホスティングする
app.use(express.static('public'));

app.get('/env.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.START_X = ${process.env.START_X};
        window.START_Y = ${process.env.START_Y};
    `);
});

// POST経由でGPS情報を受信
app.post('/gps', (req, res) => {
    const gpsData = req.body;  // { id: "A", lat: ..., lon: ... }
    console.log('Received GPS:', gpsData);

    io.emit('gps-update', gpsData);  // 端末ID付きでフロントエンドに送信
    res.sendStatus(200);
});

// WebSocket接続時の処理
io.on('connection', socket => {
    console.log('Client connected via WebSocket');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`)
});