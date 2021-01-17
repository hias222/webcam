require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, { path: '/peerws/socket.io' });

const users = {};
const rooms = [];

const socketToRoom = {};

const type = {};
const presentor = {};

async function cleanupPresentor(roomID, socketID) {
    console.log("clean")
    if (presentor[roomID] == socketID) {
        if (presentor.hasOwnProperty(roomID)) {
            delete presentor[roomID]
            console.log("delete room value " + roomID)
        }
    }
}

async function readRooms(presentor, callback){
    const existrooms = []
        //console.log("query rooms ")
        for (var key in presentor) {
            console.log("key " + key );
            if (presentor.hasOwnProperty(key)) {
                existrooms.push(key)
               // console.log("add " + key );
            }
        }
    callback(existrooms);
}

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

        if (type[roomID] === 'serve') {
            console.log("serve mode " + type[roomID] + " presentor ID " + presentor[roomID] + " user id " + socket.id)
            console.log("user in this rooms " + usersInThisRoom);
            socket.emit("all users", presentor[roomID]);
            io.to(presentor[roomID]).emit('new user', { callerID: socket.id });

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

        const roomsExist = rooms.filter(id => id === roomID);

        if (roomsExist.length === 0) {
            rooms.push(roomID)
            //console.log("romm added ", roomID)
        }

        readRooms(presentor, activeRooms => {
            console.log("send")
            console.log(activeRooms)
            socket.emit('list rooms', activeRooms);
        })

    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("closing peer", payload => {
        console.log("closing peer " + payload.callerID)
    });

    socket.on("query rooms", () => {
        readRooms(presentor, activeRooms => {
            io.to(socket.id).emit('list rooms', activeRooms);
        })
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];

        if (users[roomID] !== undefined) {
            const room = users[roomID].filter(id => id !== socket.id);
            users[roomID] = room;
        }

        if (roomID !== undefined) {
            cleanupPresentor(roomID, socket.id)
        }
        console.log("socket disconnect " + socket.id)
        socket.broadcast.emit('removePeer', { callerID: socket.id })

    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));


