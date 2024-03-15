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

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function shuffleNoCollide(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * i); // no +1 here!
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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
    if (!id) return null;
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

function calculateUserHash(ip, username, id) {
    // best security
    //return sha512(`${uniqueKey}${ip}${req.headers['user-agent']}${username}${id}`)
    return sha512(`${uniqueKey}${ip}${username}${id}`)
}

function getValidUser(roomData, username, token, ip) {
    if (username == null) {
        return roomData.users.find(user => user.token == token);
    } else {
        return roomData.users.find(user => user.token == calculateUserHash(ip, username, roomData.id));
    }
}

app.get("/myhash", (req, res) => {
    if (!req.query.username) return res.sendStatus(400);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.send(calculateUserHash(req.query.username, '00000', ip))
})

app.post('/create', (req, res) => {
    const username = req.body.username;
    if (!username) res.sendStatus(400);
    if (username.length > usernameLimit) return res.sendStatus(413);
    if (username.length < 0) return res.status(400).send("whar");
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userExists = rooms.find(room => room.users.find(user => user.token == calculateUserHash(ip, username, room.id)))
    if (userExists) return res.status(400).send("you are already in a room!");
    const roomID = generateUniqueRoomID().toString();
    if (roomID == -1) return res.sendStatus(500);
    const userToken = calculateUserHash(ip, username, roomID);
    rooms.push({
        id: roomID,
        host: username,
        round: 0,
        topicRound: 1,
        started: false,
        voting: false,
        users: [{id: null, name: username, token: userToken, points: 0}],
        rounds: shuffle(["NEWS", "RATINGS", "TRAVELLING"]),
        imgs: new Map()
    })
    return res.send({
        id: roomID,
        token: userToken
    });
})

const maxPlayers = 6;

const systemName = "SERVER"

const roomTimeouts = {};
const submitTimeouts = {};
const submitTimer = 60;

app.post('/join', (req, res) => {
    const roomID = req.body.roomID;
    const username = req.body.username;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!roomID || !username) res.sendStatus(400);
    if (username.length > usernameLimit) return res.sendStatus(413);
    if (username.length < 0) return res.status(400).send("whar");
    const roomData = getRoom(roomID)
    if (!roomData) return res.status(404).send("could not find room");
    if (roomData.users.length >= maxPlayers) return res.status(403).send(`there are too many players (${maxPlayers}) in the room`)
    if (roomData.started) return res.status(403).send("the room has already started a round");
    const userExists = roomData.users.find(user => user.name == username);
    if (userExists) return res.status(403).send("someone has the same username in that room!");
    const userInRoom = rooms.find(room => room.users.find(user => user.token == calculateUserHash(ip, username, room.id)))
    if (userInRoom) return res.status(400).send("you are already in a room!");
    const userToken = calculateUserHash(ip, username, roomID);
    roomData.users.push({ id: null, name: username, token: userToken, points: 0 });
    return res.json({
        users: roomData.users.map(user => { 
            return { name: user.name, points: user.points, idHash: sha512(user.name) }
        }),
        host: roomData.host,
        token: userToken
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



function getTopics(topic) {
    return [
        "Tell me your opinion about JOSHUA ROWBOTTOM!?!?!",
        "AAAA",
        "BBBB",
        "CCCC",
        "DDDD",
        "EEEE",
        "FFFF"
    ]
    // minimum of 6 because 6 players
    switch (topic) {
        // yes but itll be confusing!
        // can i do these later i wanna see it actually play teehee
        // these are the questions itll show anyways you wanna make a room or oka!
        // how so
        // ill make a room
        case "NEWS":
            return ["Queen lizzy has returned from the dead! What do you make of this??", ""]
        case "RATINGS":
            return ["What do you think of the latest iPhone?"]
        case "TRAVELLING":
            return ["Rate the last place you've been to.", ""]
        case "IMAGE":
            return []
    }
}

const EmojiConvertor = require('emoji-js');

// socket server stuff!
sio.on('connection', socket => {
    const ipAddr = socket.request.connection.remoteAddress;
    socket.emit('reconnect', true);
    let userData = {};
    let roomData = {};
    function broadcast(roomID, content) {
        console.log(`[${roomData.id}] SERVER > ${content}`);
        sio.to(roomID).emit('message', {
            username: systemName,
            content
        });
    }
    function sendMsg(content) {
        socket.emit('message', {
            username: systemName,
            content
        });
    }
    sendMsg("Connected!");
    socket.on('updateRoomData', () => {
        if (!roomData || !userData) return socket.emit('error', "Invalid Session.");
        roomData = getRoom(callback.id);
        if (!roomData) return socket.emit('error', "Room doesn't exist.");
        userData = getValidUser(roomData, null, callback.token, ipAddr);
    })

    function finishRound(updatedRoomData) {
        updatedRoomData.topicRound++;
        const shuffledUsers = shuffleNoCollide(updatedRoomData.users.map(x=>updatedRoomData.users.indexOf(x)))
        if (updatedRoomData.topicRound > 2) {
            updatedRoomData.voting = true;
            updatedRoomData.users = updatedRoomData.users.map(user => {
                user.finished = false;
                return user;
            })
            const submissions = updatedRoomData.users.map(user => {
                return {
                    username: user.topic2user,
                    title: user.topic2,
                    desc: user.response2
                }
            })
            sio.to(roomData.id).emit('roomEvent', { event: "results", submissions });
        } else {
            updatedRoomData.users = updatedRoomData.users.map(user => {
                const shuffledUser = updatedRoomData.users[shuffledUsers[updatedRoomData.users.indexOf(user)]]; // insanity
                user.topic2 = shuffledUser.response1
                user.topic2user = shuffledUser.name
                user.finished = false;
                return user;
            })
            submitTimeouts[roomData.id] = setTimeout(notEveryoneDid, submitTimer * 1000)
            updatedRoomData.users.forEach(user => {
                sio.to(user.id).emit('roomEvent', { event: "nextround", user: user.topic2user, prompt: user.topic2 });
            })
        }
    }

    function notEveryoneDid() {
        const updatedRoomData = getRoom(roomData.id);
        if (!updatedRoomData) return;
        const usersThatDidnt = updatedRoomData.users.filter(user => !user.finished)
        console.log(`[${updatedRoomData.id}] some people (${usersThatDidnt.length}) didnt finish`)
        updatedRoomData.users = updatedRoomData.users.map(user => {
            if (user.finished) return user;
            user[`response${updatedRoomData.topicRound}`] = "[No response given]";
            user.finished = true;
            sio.to(roomData.id).emit('roomEvent', { event: "waiting", users: [] });
            return user;
        })
        finishRound(updatedRoomData)
    }

    socket.on('roomEvent', (data) => {
        if (roomData.host != userData.name) return socket.emit('error', "you really thought.") //todo: remove this since i might allow other playres to do events
        const updatedRoomData = getRoom(roomData.id);
        if (!updatedRoomData) return socket.emit('error', "couldnt find room")
        switch (data.event) {
            case "start":
                updatedRoomData.started = true;
                sio.to(roomData.id).emit('roomEvent', { event: "start" });
                break;
            case "nexttopic":
                clearTimeout(submitTimeouts[roomData.id]);
                updatedRoomData.round++;
                //const roundName = updatedRoomData.rounds[updatedRoomData.round]
                const roundName = "RATINGS"
                const topics = shuffle(getTopics(roundName))
                updatedRoomData.users = updatedRoomData.users.map(user => {
                    user.finished = false;
                    user.topic1 = topics[updatedRoomData.users.indexOf(user)]; // shuffle it! do a func or something
                    sio.to(user.id).emit('roomEvent', { event: "yourtopic", topic: user.topic1 })
                    return user;
                })
                submitTimeouts[roomData.id] = setTimeout(notEveryoneDid, submitTimer * 1000)
                sio.to(roomData.id).emit('roomEvent', { event: "nexttopic", round: updatedRoomData.round, roundName });
                break;
        }
    })

    socket.on("topicFinish", (content) => {
        if (content.length > 50) return socket.emit("error", "response too long");
        const updatedRoomData = getRoom(roomData.id);
        if (!updatedRoomData) return socket.emit('error', "couldnt find room")
        if (updatedRoomData.voting) return socket.emit('error', "how")
        
        const updatedUserData = updatedRoomData.users.find(user => user.name == userData.name);
        updatedUserData[`response${updatedRoomData.topicRound}`] = content;
        updatedUserData.finished = true;
        userData = updatedUserData;
        roomData = updatedRoomData;
        sio.to(roomData.id).emit('roomEvent', { event: "waiting", users: updatedRoomData.users.filter(user => !user.finished).map(user => {
            return { username: user.name, hash: sha512(user.name) }
        }) });
        if (!updatedRoomData.users.filter(user => !user.finished).length) {
            clearTimeout(submitTimeouts[roomData.id]);
            finishRound(updatedRoomData);
        }
    })
    socket.on('join', async (callback) => {
        roomData = getRoom(callback.id);
        if (!roomData) return socket.emit('error', "Room doesn't exist.");
        userData = getValidUser(roomData, null, callback.token, ipAddr);
        if (!userData) return socket.emit('error', "Invalid Token.");
        if (userData.name == "SERVER") {
            roomData.users.splice(roomData.users.indexOf(userData), 1);
            socket.emit('error', "no thank you! bye bye!");
            socket.emit('forceDisconnect');
            socket.disconnect();
            broadcast(roomData.id, "someone did something sus");
        }
        userData.id = socket.id;
        socket.emit("roomState", {
            started: roomData.started,
            round: roomData.round
        })
        socket.join(roomData.id);
        socket.emit("addme", {
            name: userData.name,
            points: userData.points,
            idHash: sha512(userData.name)
        });
        if (!userData.joined) {
            userData.joined = true;
            sio.to(roomData.id).emit('join', {
                username: userData.name,
                idHash: sha512(userData.name)
            });
            broadcast(roomData.id, `${userData.name} has joined!`);
        } else {
            roomData.users.forEach(user => {
                socket.emit("join", {
                    username: user.name,
                    idHash: sha512(user.name),
                    reconnect: true,
                    host: roomData.host == user.name
                })
            })
            clearTimeout(roomTimeouts[`${roomData.id}-${userData.name}`]);
        }
    });
    // i just realized i didnt even need to do any authentication after first authenticating, why didnt i realize this back then
    socket.on('user_message', async (content) => {
        if (!roomData || !userData) return socket.emit('error', "Invalid Session.");
        if (content.length > 256) return socket.emit('error', "Message too long!");
        
        const emoji = new EmojiConvertor();
        emoji.replace_mode = "unified"
        content = emoji.replace_colons(content);
        content = content.replaceAll("/shrug", "¯\\_(ツ)_/¯")
        console.log(`[${roomData.id}] ${userData.name} > ${content}`);
        switch (content.split(" ")[0]) {
            case "/fumo":
                content = `⠀⢀⣒⠒⠆⠤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢠⡛⠛⠻⣷⣶⣦⣬⣕⡒⠤⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⡿⢿⣿⣿⣿⣿⣿⡿⠿⠿⣿⣳⠖⢋⣩⣭⣿⣶⡤⠶⠶⢶⣒⣲⢶⣉⣐⣒⣒⣒⢤⡀⠀⠀⠀⠀⠀⠀⠀
⣿⠀⠉⣩⣭⣽⣶⣾⣿⢿⡏⢁⣴⠿⠛⠉⠁⠀⠀⠀⠀⠀⠀⠉⠙⠲⢭⣯⣟⡿⣷⣘⠢⡀⠀⠀⠀⠀⠀
⠹⣷⣿⣿⣿⣿⣿⢟⣵⠋⢠⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣾⣦⣾⣢⠀⠀⠀⠀
⠀⠹⣿⣿⣿⡿⣳⣿⠃⠀⣼⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣿⣿⠟⠀⠀⠀⠀
⠀⠀⠹⣿⣿⣵⣿⠃⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠈⠛⣯⡇⠛⣽⣦⣿⠀⠀⠀⠀⢀⠔⠙⣄⠀⠀⠀⠀⠀⠀⣠⠳⡀⠀⠀⠀⠀⢿⡵⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣸⣿⣿⣿⠿⢿⠟⠀⠀⠀⢀⡏⠀⠀⠘⡄⠀⠀⠀⠀⢠⠃⠀⠹⡄⠀⠀⠀⠸⣿⣷⡀⠀⠀⠀
⠀⠀⠀⢰⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⢸⠒⠤⢤⣀⣘⣆⠀⠀⠀⡏⢀⣀⡠⢷⠀⠀⠀⠀⣿⡿⠃⠀⠀⠀
⠀⠀⠀⠸⣿⣿⠟⢹⣥⠀⠀⠀⠀⠀⣸⣀⣀⣤⣀⣀⠈⠳⢤⡀⡇⣀⣠⣄⣸⡆⠀⠀⠀⡏⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠁⠁⠀⢸⢟⡄⠀⠀⠀⠀⣿⣾⣿⣿⣿⣿⠁⠀⠈⠙⠙⣯⣿⣿⣿⡇⠀⠀⢠⠃⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠇⢨⢞⢆⠀⠀⠀⡿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⣿⣿⣿⡿⡇⠀⣠⢟⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⡼⠀⢈⡏⢎⠳⣄⠀⡇⠙⠛⠟⠛⠀⠀⠀⠀⠀⠀⠘⠻⠛⢱⢃⡜⡝⠈⠚⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⣅⠁⢸⣋⠈⢣⡈⢷⠇⠀⠀⠀⠀⠀⣄⠀⠀⢀⡄⠀⠀⣠⣼⢯⣴⠇⣀⡀⢸⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠳⡌⠛⣶⣆⣷⣿⣦⣄⣀⠀⠀⠀⠈⠉⠉⢉⣀⣤⡞⢛⣄⡀⢀⡨⢗⡦⠎⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠪⣿⠁⠀⠐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠉⠁⢸⠀⠀⠀⠄⠙⡆⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣀⠤⠚⡉⢳⡄⠡⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠁⣠⣧⣤⣄⣀⡀⡰⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⠔⠉⠀⠀⠀⠀⢀⣧⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣅⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⠆⠀⠀⠀⣀⣼⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠟⠋⠁⣠⠖⠒⠒⠛⢿⣆⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠑⠤⠴⠞⢋⣵⣿⢿⣿⣿⣿⣿⣿⣿⠗⣀⠀⠀⠀⠀⠀⢰⠇⠀⠀⠀⠀⢀⡼⣶⣤⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠟⢛⣿⠀⠙⠲⠽⠛⠛⠵⠞⠉⠙⠳⢦⣀⣀⡞⠀⠀⠀⠀⡠⠋⠐⠣⠮⡁⠀
⠀⠀⠀⠀⠀⠀⠀⢠⣎⡀⢀⣾⠇⢀⣠⡶⢶⠞⠋⠉⠉⠒⢄⡀⠉⠈⠉⠀⠀⠀⣠⣾⠀⠀⠀⠀⠀⢸⡀
⠀⠀⠀⠀⠀⠀⠀⠘⣦⡀⠘⢁⡴⢟⣯⣞⢉⠀⠀⠀⠀⠀⠀⢹⠶⠤⠤⡤⢖⣿⡋⢇⠀⠀⠀⠀⠀⢸⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠵⠗⠺⠟⠖⢈⡣⡄⠀⠀⠀⠀⢀⣼⡤⣬⣽⠾⠋⠉⠑⠺⠧⣀⣤⣤⡠⠟⠃
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠷⠶⠦⠶⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`
                break;
            case "/padoru": content = `PADORU PADORU!!!
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
`
                break;
        }
        content = content.replaceAll("/joinkers")

        sio.to(roomData.id).emit('message', {
            username: userData.name,
            content
        });
    })

    socket.on('leave', () => {
        if (!roomData || !userData) return;
        broadcast(roomData.id, `${userData.name} has left.`);
        roomData.users.splice(roomData.users.indexOf(userData), 1);
        socket.emit("leave", sha512(userData.name));
        if (roomData.host == userData.name) {
            console.log(`Destroy room ${roomData.id}`);
            sio.to(roomData.id).emit("forceDisconnect", "The host has left.");
            rooms.splice(rooms.indexOf(roomData), 1);
        }
        roomData = {};
        userData = {};
    })
    socket.on('disconnect', () => {
        if (!roomData || !userData) return;
        let username = userData.name;
        let roomID = roomData.id
        roomData = {};
        userData = {};
        if (!getRoom(roomID)) return;
        // Set a timeout to delete the room if no reconnection occurs
        roomTimeouts[`${roomID}-${username}`] = setTimeout(() => {
            let roomData = getRoom(roomID);
            if (roomData.host == username) {
                sio.to(roomData.id).emit("forceDisconnect", "The host has left.");
                rooms.splice(rooms.indexOf(roomData), 1);
            } else {
                broadcast(roomData.id, `${username} has left.`);
                roomData.users.splice(roomData.users.indexOf(roomData.users.find(user => user.name == username)), 1);
                socket.emit("leave", sha512(username));
            }
        }, 5000); // Adjust this time as per your requirements
    });
})

if (DEVELOPMENT) {
    app.get('/sti/:room', (_, res) => {
        res.sendFile(path.resolve(__dirname + "/../sti/index.html"))
    })
    app.get('/stop', (_, res) => {
        console.log("death.") //hi
        res.status(404).send("i am become death, destroyer of worlds")
        process.exit(0);
    })
} else {
    app.get('/', (_, res) => {
        res.sendStatus(200)
    });
}

server.listen(3000, async () => {
    console.log(`Server Listening on port @3000`)
})
