/*
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⢀⣀⣀⡀⠄⠄⠄⡠⢲⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠄⠄
⠄⠄⠄⠔⣈⣀⠄⢔⡒⠳⡴⠊⠄⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⣿⣿⣧⠄⠄
⠄⢜⡴⢑⠖⠊⢐⣤⠞⣩⡇⠄⠄⠄⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠄⠝⠛⠋⠐
⢸⠏⣷⠈⠄⣱⠃⠄⢠⠃⠐⡀⠄⠄⠄⠄⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠸⠄⠄⠄⠄
⠈⣅⠞⢁⣿⢸⠘⡄⡆⠄⠄⠈⠢⡀⠄⠄⠄⠄⠄⠄⠉⠙⠛⠛⠛⠉⠉⡀⠄⠡⢀⠄⣀
⠄⠙⡎⣹⢸⠄⠆⢘⠁⠄⠄⠄⢸⠈⠢⢄⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠃⠄⠄⠄⠄⠄
⠄⠄⠑⢿⠈⢆⠘⢼⠄⠄⠄⠄⠸⢐⢾⠄⡘⡏⠲⠆⠠⣤⢤⢤⡤⠄⣖⡇⠄⠄⠄⠄⠄
⣴⣶⣿⣿⣣⣈⣢⣸⠄⠄⠄⠄⡾⣷⣾⣮⣤⡏⠁⠘⠊⢠⣷⣾⡛⡟⠈⠄⠄⠄⠄⠄⠄
⣿⣿⣿⣿⣿⠉⠒⢽⠄⠄⠄⠄⡇⣿⣟⣿⡇⠄⠄⠄⠄⢸⣻⡿⡇⡇⠄⠄⠄⠄⠄⠄⠄
⠻⣿⣿⣿⣿⣄⠰⢼⠄⠄⠄⡄⠁⢻⣍⣯⠃⠄⠄⠄⠄⠈⢿⣻⠃⠈⡆⡄⠄⠄⠄⠄⠄
⠄⠙⠿⠿⠛⣿⣶⣤⡇⠄⠄⢣⠄⠄⠈⠄⢠⠂⠄⠁⠄⡀⠄⠄⣀⠔⢁⠃⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⣿⣿⣿⣿⣾⠢⣖⣶⣦⣤⣤⣬⣤⣤⣤⣴⣶⣶⡏⠠⢃⠌⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠿⠿⠟⠛⡹⠉⠛⠛⠿⠿⣿⣿⣿⣿⣿⡿⠂⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠠⠤⠤⠄⠄⣀⠄⠄⠄⠑⠠⣤⣀⣀⣀⡘⣿⠿⠙⠻⡍⢀⡈⠂⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠑⠠⣠⣴⣾⣿⣿⣿⣿⣿⣿⣇⠉⠄⠻⣿⣷⣄⡀⠄⠄⠄⠄⠄⠄⠄⠄
PADORU PADORU!!!!
*/

const DEVELOPMENT = true;

const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');

app.use(express.static(__dirname + "/../"))

const usernameLimit = 10;

const sio = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors({
    origin: true
}))

app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

app.use(express.raw({ limit: '100mb' })); // , type: 'image/*'

const sha512 = (str) => crypto.createHash('sha512').update(str).digest('hex');
const base64_encode = (str) => Buffer.from(str, 'utf-8').toString('base64');
const base64_decode = (str) => Buffer.from(str, 'base64').toString('utf-8');


// TODO: give each user a "token" when joining a room, that they keep

function randomID(length = 16) {
    var text = "";
    //var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const chars = "0123456789"
    for (var i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

let rooms = [];

function getRoom(id) {
    return rooms.find(room => room.id.toString() == id.toString());
}

function generateUniqueRoomID() {
    let roomId;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        roomId = randomID(5);
        
        // Check if the generated roomId is unique
        if (!getRoom(roomId)) {
            return roomId; // Return the unique roomId
        }
        // neff do you realize how bad this is1?!?! well realistically we wouldnt reach that many people but brUH
        console.log(`Attempt ${attempts} at finding available room ID`);
        

        attempts++;
    }

    return -1;
}
function uploadFileRoom(id, hash) {
    const room = getRoom(id);
    if (!room) return false;
    room.imgs.push(hash);
    return true;
}

const uniqueKey = crypto.randomBytes(16).toString('hex');

function calculateUserHash(req, username, id) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // best security
    return sha512(`${uniqueKey}${ip}${req.headers['user-agent']}${username}${id}`)
}

app.get("/myhash", (req, res) => {
    if (!req.query.username) return res.sendStatus(400);
    res.send(calculateUserHash(req, req.query.username, 0))
})

app.post('/create', (req, res) => {
    const username = req.body.username;
    if (!username) res.sendStatus(400);
    if (username.length > usernameLimit) return res.sendStatus(413);
    if (username.length < 0) return res.status(400).send("whar");
    const userExists = rooms.find(room => room.users.find(user => user.token == calculateUserHash(req, username, room.id)))
    if (userExists) return res.status(400).send("you are already in a room!");
    const roomID = generateUniqueRoomID().toString();
    if (roomID == -1) return res.sendStatus(500);
    const userToken = calculateUserHash(req, username, roomID);
    rooms.push({
        id: roomID,
        host: username,
        round: 0,
        started: false,
        users: [{name: username, token: userToken, points: 0}],
        imgs: new Map()
    })
    return res.send({
        id: roomID
        //token: userToken
    });
})

app.post('/join', (req, res) => {
    const roomID = req.body.roomID;
    const username = req.body.username;
    if (!roomID || !username) res.sendStatus(400);
    if (username.length > usernameLimit) return res.sendStatus(413);
    if (username.length < 0) return res.status(400).send("whar");
    const roomData = getRoom(roomID)
    if (!roomData) return res.status(404).send("could not find room");
    if (roomData.started) return res.status(403).send("the room has already started a round")
    const userExists = roomData.users.find(user => user.name == username);
    if (userExists) return res.status(403).send("someone has the same username in that room!");
    const userInRoom = rooms.find(room => room.users.find(user => user.token == calculateUserHash(req, username, room.id)))
    if (userInRoom) return res.status(400).send("you are already in a room!");
    const userToken = calculateUserHash(req, username, roomID);
    roomData.users.push({ name: username, token: userToken, points: 0 });
    return res.json({
        users: roomData.users.map(user => user.name),
        host: roomData.host
        //token: userToken
    })
})

app.post('/upload', (req, res) => {
    // bad security 101
    // but who cares [as]
    const roomID = req.query.roomID;
    const roomData = getRoom(roomID);
    const file = req.body.file;
    if (!file || file.length === 0) return res.status(400).send('Invalid file');
    if (!roomID || !file) return res.sendStatus(400);
    const hash = sha512(file)
    roomData.imgs.set(hash, {
        buffer: file,
        extension: req.get('Content-Type')
    });
    uploadFileRoom(roomID, hash);
    res.send(hash);
})

app.get('/imgs/:room/:hash', (req, res) => {
    const hash = req.params.hash;
    const room = req.params.room;
    const roomData = getRoom(room);
    if (!roomData) return res.sendStatus(404);

    // Check if the hash exists in the storage
    if (!roomData.imgs.has(hash)) return res.status(404).send('Image not found');

    // Retrieve the image buffer from storage
    const { buffer, extension } = roomData.imgs.get(hash);

    // Set the appropriate content type and send the image buffer
    res.set('Content-Type', extension); // Change the content type according to your image type
    res.send(buffer);
});

if (DEVELOPMENT) {
    app.get('/sti/:room', (req, res) => {
        res.sendFile(path.resolve(__dirname + "/../sti/index.html"))
    })
    app.get('/stop', (req, res) => {
        console.log("death.") //hi
        res.status(404).send("death")
        process.exit(0);
    })
} else {
    app.get('/', (req, res) => {
        res.sendStatus(200)
    });
}

server.listen(3000, async () => {
    console.log(`Server Listening on port @3000`)
})