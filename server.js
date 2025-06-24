const { handleTopicData } = require('./topicHandler');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const env = require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 }, () => {
    console.log('✅ WebSocket Server is listening on port 3001');
});

wss.on('connection', ws => {
    console.log("WebSocket（3001）経由での接続を受けました");

    ws.on('message', message => {
        // const messageString = message.toString();
        console.log(`WebSocketメッセージ受信: ${message}`);
        try {
            const data = JSON.parse(message);
            // data.raw_message = messageString;
            handleTopicData(io, data);
        } catch (err) {
            console.error('JSON parse error:', err);
        }
    });

    ws.on('close', () => {
        console.log("WebSocket切断 (3001)");
    });
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/env.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.START_X = ${process.env.START_X};
        window.START_Y = ${process.env.START_Y};
    `);
});

// WebSocket接続時の処理
io.on('connection', socket => {
    console.log('Socket.IOクライアント接続 (3000)');
    socket.on('disconnect', () => {
        console.log('Socket.IOクライアント切断');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`)
});

console.log("WebSocket サーバー待機中: ws://localhost:3001");