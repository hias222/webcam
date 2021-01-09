require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, { path: '/peerws/socket.io' });

const users = {};

const socketToRoom = {};

const type = {};
const presentor = {};

io.on('connection', socket => {
    socket.on("join room", roomID => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            type[roomID] = "multi";
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        if (type[roomID] === 'serve'){
            console.log("serve mode " + type[roomID] + " presentor ID " + presentor[roomID] + " user id " + socket.id)
            console.log("userinthisrooms " + usersInThisRoom);
            socket.emit("all users", presentor[roomID]);
        } else {
            console.log("multi mode " + type[roomID])
            socket.emit("all users", usersInThisRoom);
        }

    });

    socket.on("create serve", roomID => {
        // create new empty room
        type[roomID] = "serve";
        users[roomID] = [socket.id];
        presentor[roomID] = [socket.id];

        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        console.log("create serve ", users);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));


