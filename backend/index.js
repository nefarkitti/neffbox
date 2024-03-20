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

const DEVELOPMENT = false;

import path from 'path';
import express from 'express';
import http from 'http';
const app = express();
const server = http.createServer(app);
import rateLimit from 'express-rate-limit';
import validator from 'express-validator';
import cors from 'cors';
import crypto from 'crypto';
import imageType from 'image-type';
import url from 'url';

// simple fix 
if (DEVELOPMENT) {

    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    app.use(express.static(__dirname + "/../"))
}
// simple fix

const usernameLimit = 10;

import { Server } from 'socket.io'
const sio = new Server(server, {
    cors: {
        origin: "*"
    }
});
app.set("trust proxy", 1);

app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    message: "Too many requests are being sent! Please try again later."
}))

app.use(cors({
    origin: true
}))

app.use(express.urlencoded({
    extended: false
}))
app.use(
    express.json({
        limit: '80mb', // 100 might be a bit too much
        verify: (req, res, buf, encoding) => {
            try {
                JSON.parse(buf);
            } catch (e) {
                res.status(403).send('no.');
                throw Error('invalid JSON');
            }
        }
    })
)

//app.use(express.raw({ limit: '100mb' })); // , type: 'image/*'

const sha512 = (str) => crypto.createHash('sha512').update(str).digest('hex');
const base64_encode = (str) => Buffer.from(str, 'utf-8').toString('base64');
const base64_decode = (str) => Buffer.from(str, 'base64').toString('utf-8');

function shuffleNoCollide(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * i); // no +1 here!
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function shuffle(array) {
    return shuffleNoCollide(array);
    //let currentIndex = array.length-1,  randomIndex;
    let currentIndex = array.length, randomIndex;

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

function genUser(username, userToken) {
    return {
        id: null,
        name: username,
        token: userToken,
        points: 0,
        finished: false,
        topic2: null,
        topic2user: null,
        response1: null,
        response2: null,
        votedFor: null
    }
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

const uniqueKey = crypto.randomBytes(16).toString('hex');

function calculateUserHash(ip, username, id) {
    const evenMoreUniqueKey = crypto.randomBytes(32).toString('hex');
    // best security
    //return sha512(`${uniqueKey}${ip}${req.headers['user-agent']}${username}${id}`)
    return sha512(`${uniqueKey}${ip}${username}${id}${evenMoreUniqueKey}`)
}

function getValidUser(roomData, username, token, ip) {
    if (username == null) {
        return roomData.users.find(user => user.token == token);
    } else {
        return roomData.users.find(user => user.token == calculateUserHash(ip, username, roomData.id));
    }
}

app.get("/myhash", validator.query('username').notEmpty().isString(), (req, res) => {
    const result = validator.validationResult(req);
    if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
    if (!req.query.username) return res.sendStatus(400);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.send(calculateUserHash(req.query.username, '00000', ip))
})

app.use('/create', rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    message: "Too many requests are being sent! Please try again later.",
}))
app.use('/join', rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    message: "Too many requests are being sent! Please try again later.",
}))
app.use('/upload', rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 2,
    standardHeaders: true,
    message: "Too many requests are being sent! Please try again later.",
}))

function simpleRandom(max) {
    return Math.floor(Math.random() * max + 1);
}

app.post('/create', validator.body('username').notEmpty().isString(), (req, res) => {
    const result = validator.validationResult(req);
    if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
    const username = req.body.username;
    if (!username || typeof username != 'string') res.sendStatus(400);
    if (username.length > usernameLimit) return res.sendStatus(413);
    if (!username.length) return res.status(400).send("whar");
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userExists = rooms.find(room => room.users.find(user => user.token == calculateUserHash(ip, username, room.id)))
    if (userExists) return res.status(400).send("you are already in a room!");
    const roomID = generateUniqueRoomID().toString();
    if (roomID == -1) return res.sendStatus(500);
    const userToken = calculateUserHash(ip, username, roomID);

    let allPossibleRounds = ["NEWS", "RATINGS", "TRAVELLING", "SHOPPING"] // im sorry if this change breaks something @firee
    let actualChosenRounds = []

    for (let i = 0; i < 3; i++) { // 3 times hopefully i cant test rn
        const rolled = allPossibleRounds[simpleRandom(allPossibleRounds.length - 1)]
        actualChosenRounds.push(rolled)
        allPossibleRounds.splice(allPossibleRounds.indexOf(rolled), 1)
        // support for multiple different rounds
        // im sorry if this breaks something
    }

    rooms.push({
        id: roomID,
        host: username,
        round: 0,
        topicRound: 1,
        started: false,
        voting: false,
        users: [genUser(username, userToken)],
        rounds: [...shuffle(actualChosenRounds), "IMAGE"],
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

app.post(
    '/join',
    validator.body('roomID').notEmpty().isInt(),
    validator.body('username').notEmpty().isString(),
    (req, res) => {
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const roomID = req.body.roomID;
        const username = req.body.username;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!roomID || !username) res.sendStatus(400);
        if (typeof roomID != "string" || typeof username != "string") res.sendStatus(400);
        if (username.length > usernameLimit) return res.sendStatus(413);
        if (!username.length) return res.status(400).send("whar");
        const roomData = getRoom(roomID)
        if (!roomData) return res.status(404).send("could not find room");
        if (roomData.users.length >= maxPlayers) return res.status(403).send(`there are too many players (${maxPlayers}) in the room`)
        if (roomData.started) return res.status(403).send("the room has already started a round");
        const userExists = roomData.users.find(user => user.name == username);
        if (userExists) return res.status(403).send("someone has the same username in that room!");
        const userInRoom = rooms.find(room => room.users.find(user => user.token == calculateUserHash(ip, username, room.id)))
        if (userInRoom) return res.status(400).send("you are already in a room!");
        const userToken = calculateUserHash(ip, username, roomID);
        roomData.users.push(genUser(username, userToken));
        return res.json({
            users: roomData.users.map(user => {
                return { name: user.name, points: user.points, idHash: sha512(user.name) }
            }),
            host: roomData.host,
            token: userToken
        })
    }
)

function isValidBase64(str) {
    if (typeof str !== 'string') return false;
    const regex = /^(data:image\/[a-zA-Z]+;base64,)/;
    return regex.test(str);
}

app.post('/upload', validator.query('roomID').notEmpty().isInt(), validator.body('username').notEmpty().isString(), validator.body('ext').notEmpty().isString(), validator.body('file').notEmpty().isString(), (req, res) => {
    const result = validator.validationResult(req);
    if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
    // neffi the neffi
    const roomID = req.query.roomID;
    const roomData = getRoom(roomID);
    if (!roomData) return res.sendStatus(404);
    const file = req.body.file;
    const extension = req.body.ext;
    const username = req.body.username
    if (!file || file.length === 0) return res.status(400).send('Invalid file');
    if (!roomID || !file || !extension || !username) return res.sendStatus(400);
    //if (!isValidBase64(file)) return res.status(400).send("Invalid base64.")
    const base64ImageData = file.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64ImageData, 'base64');
    imageType(buffer).then(type => {
        if (!type) return res.status(400).send('Invalid image file');
        if (!type.mime || !type.mime.startsWith('image')) return res.status(400).send('Invalid image file');
        if (extension != type.mime) return res.status(400).send("Extensions do not match!");
        const hash = sha512(file)
        console.debug(`/upload - ${roomID} - ${hash}`);
        const findUser = roomData.users.find(user => {
            return user.name == username
        })
        if (!findUser) return res.status(403).send("you tried uploading a file, but you dont have access to the room");
        if (!file.startsWith("data")) return;

        roomData.imgs.set(hash, {
            buffer: file,
            extension: type.mime
        });
        findUser.file = hash;
        res.send(hash);

    }).catch(e => {
        res.sendStatus(500);
        console.error(e);
    });
})

app.get('/imgs/:room/:hash', validator.query("room").notEmpty().isInt(), validator.query("hash").notEmpty().isString(), (req, res) => {
    const hash = req.params.hash;
    const room = req.params.room;
    const roomData = getRoom(room);
    if (!roomData) return res.sendStatus(404);

    // Check if the hash exists in the storage
    if (!roomData.imgs.has(hash)) return res.status(404).send('Image not found');

    // Retrieve the image buffer from storage
    const { buffer, extension } = roomData.imgs.get(hash);
    const base64ImageData = buffer.replace(/^data:image\/\w+;base64,/, '')

    // Set the appropriate content type and send the image buffer
    res.set('Content-Type', extension); // Change the content type according to your image type
    res.send(Buffer.from(base64ImageData, 'base64'));
});

function getTopics(topic) {
    // minimum of 6 because 6 players
    console.log(`getTopics(${topic})`)
    switch (topic) {
        // yesssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
        case "NEWS":
            return ["How would you react if the world ended right now?"]
        case "RATINGS":
            return ["Review the last food that you've had.", "Review someone you know"]
        case "TRAVELLING":
            return ["Review the last place you've been to."]
        case "SHOPPING":
            return ["Describe/review the latest product you've bought."]
        case "IMAGE": // image would have a single one because there's no point in having multiple prompts
            return ["Provide us with a funny image!"]
        default:
            return ["Uhh! Something went wrong!"]
    }
}

navigator.product = "ReactNative"
import EmojiConvertor from 'emoji-js';
const emoji = new EmojiConvertor();
//emoji.replace_mode = "unified" //

function addPoints(roomID, username, points) {
    const roomData = getRoom(roomID);
    if (!roomData) return;
    const findUser = roomData.users.find(user => {
        user.name == username;
    })
    if (!findUser) return;
    findUser.points = findUser.points + points;

}

// socket server stuff!
sio.on('connection', socket => {
    const ipAddr = socket.request.connection.remoteAddress;
    socket.emit('reconnect', true);
    let userData = {};
    let roomData = {};
    function broadcast(roomID, content) {
        console.log(`[${roomID}] SERVER > ${content}`);
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
        const shuffledUsers = shuffleNoCollide(updatedRoomData.users.map(x => updatedRoomData.users.indexOf(x)))
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
                    desc: user.response2,
                    file: user.file2user
                }
            })
            sio.to(roomData.id).emit('roomEvent', { event: "results", submissions });
        } else {
            updatedRoomData.voting = false;
            updatedRoomData.users = updatedRoomData.users.map(user => {
                const shuffledUser = updatedRoomData.users[shuffledUsers[updatedRoomData.users.indexOf(user)]]; // insanity
                user.topic2 = shuffledUser.response1
                user.topic2user = shuffledUser.name
                user.file2user = shuffledUser.file
                user.finished = false;
                return user;
            })
            submitTimeouts[roomData.id] = setTimeout(notEveryoneDid, ((updatedRoomData.doubleTime) ? submitTimer * 2 : submitTimer) * 1000)
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
        updatedRoomData.voting = false;
        finishRound(updatedRoomData)
    }

    socket.on('roomEvent', (data) => {
        if (roomData.host != userData.name) return socket.emit('error', "you really thought.") //todo: remove this since i might allow other playres to do events
        const updatedRoomData = getRoom(roomData.id);
        if (!updatedRoomData) return socket.emit('error', "couldnt find room")
        switch (data.event) {
            case "start":
                if (updatedRoomData.users.length < 3) return sio.to(roomData.id).emit('error', "You need to have at least 3 players to start.");
                updatedRoomData.started = true;
                updatedRoomData.round = 0;
                updatedRoomData.topicRound = 1;
                sio.to(roomData.id).emit('roomEvent', { event: "start" });
                break;
            case "nexttopic":
                clearTimeout(submitTimeouts[roomData.id]);
                updatedRoomData.round++;
                updatedRoomData.topicRound = 1;
                const roundName = updatedRoomData.rounds[updatedRoomData.round - 1]
                if (!roundName) {
                    // assume that rounds ended
                    updatedRoomData.voting = false;
                    updatedRoomData.started = false;
                    const winner = updatedRoomData.users.reduce((prevUser, currentUser) => {
                        return (prevUser.points > currentUser.points) ? prevUser : currentUser;
                    });
                    sio.to(roomData.id).emit('roomEvent', { event: "gameend", username: winner.name, points: winner.points })
                    updatedRoomData.users = updatedRoomData.users.map(user => {
                        return {
                            id: user.id,
                            name: user.name,
                            token: user.token,
                            points: 0,
                            finished: false,
                            topic2: null,
                            topic2user: null,
                            response1: null,
                            response2: null,
                            votedFor: null
                        }
                    })
                    return;
                }
                if (roundName == "IMAGE") {
                    updatedRoomData.doubleTime = true;
                } else {
                    updatedRoomData.doubleTime = false;
                }
                const topics = shuffle(getTopics(roundName))
                updatedRoomData.users = updatedRoomData.users.map(user => {
                    user.finished = false;
                    delete user.votedFor;
                    user.topic2 = null
                    user.topic2response = null
                    if (topics.length == 1) {
                        user.topic1 = topics[0];
                    } else {
                        user.topic1 = topics[updatedRoomData.users.indexOf(user)];
                    }
                    sio.to(user.id).emit('roomEvent', { event: "yourtopic", topic: user.topic1 })
                    return user;
                })
                updatedRoomData.voting = false;
                submitTimeouts[roomData.id] = setTimeout(notEveryoneDid, submitTimer * 1000)
                sio.to(roomData.id).emit('roomEvent', { event: "nexttopic", round: updatedRoomData.round, roundName });
                break;
            case "votingtime":
                setTimeout(function () {
                    const updatedRoomData = getRoom(roomData.id);
                    if (!updatedRoomData) return socket.emit('error', "couldnt find room");
                    const unvoters = updatedRoomData.users.filter(user => !user.votedFor);
                    for (let i = 0; i < unvoters.length; i++) {
                        const randomUsers = shuffle(updatedRoomData.users);
                        const randomUser = randomUsers[0];
                        let findUser = updatedRoomData.users.find(user => {
                            return user.topic2user == randomUser.name
                        });
                        if (findUser.name == unvoters[i].name) {
                            findUser = updatedRoomData.users.find(user => {
                                return user.topic2user == randomUsers[1].name
                            });
                            if (!findUser) break;
                        }
                        // yeah no im not going to add a check, im too lazy!
                        unvoters[i].votedFor = {
                            username: randomUser.topic2user,
                            title: randomUser.topic2,
                            desc: randomUser.response2,
                            file: randomUser.file,
                            actual: findUser.name
                        }
                    }
                    const allVoters = updatedRoomData.users.filter(user => user.votedFor).map(user => user.votedFor);

                    if (!allVoters.length) return sio.to(roomData.id).emit('roomEvent', {
                        event: "winneris",
                        noone: true
                    })
                    const submitterCounts = {};
                    allVoters.forEach(vote => {
                        const submitter = vote.actual;
                        submitterCounts[submitter] = (submitterCounts[submitter] || 0) + 1;
                    });

                    // Find the submitter with the highest count
                    let winner;
                    let maxVotes = -1;
                    for (const submitter in submitterCounts) {
                        if (submitterCounts[submitter] > maxVotes) {
                            maxVotes = submitterCounts[submitter];
                            winner = submitter;
                        }
                    }
                    const winnerObj = allVoters.find(vote => vote.actual === winner);

                    const winnerUser = updatedRoomData.users.find(user => user.name == winnerObj.actual)
                    const sacUser = updatedRoomData.users.find(user => user.name == winnerObj.username)
                    let winnerPoints = maxVotes * 100;
                    let sacPoints = (maxVotes * 100) * (1 / 5);
                    if (updatedRoomData.doubleTime) {
                        winnerPoints *= 2
                        sacPoints *= 2
                    }
                    /*addPoints(updatedRoomData.id, winnerUser.name, winnerPoints)
                    addPoints(updatedRoomData.id, sacUser.name, sacPoints)*/
                    winnerUser.points = winnerUser.points + winnerPoints
                    sacUser.points = sacUser.points + sacPoints
                    sio.to(roomData.id).emit('roomEvent', {
                        event: "winneris",
                        submission: winnerObj,
                        winner: winnerObj.actual,
                        voteCount: maxVotes,
                        winPoints: {
                            hash: sha512(winnerUser.name),
                            points: winnerPoints
                        },
                        sacPoints: {
                            hash: sha512(sacUser.name),
                            points: sacPoints
                        },
                    })
                }, 30000)
                break;
        }
    })

    socket.on("topicFinish", (content) => {
        if (!content || typeof content != "string") return socket.emit("error", "nice try")
        if (content.length > 50) return socket.emit("error", "response too long");
        const updatedRoomData = getRoom(roomData.id);
        if (!updatedRoomData) return socket.emit('error', "couldnt find room");
        if (updatedRoomData.voting) return socket.emit('error', "how")

        const updatedUserData = updatedRoomData.users.find(user => user.name == userData.name);
        content = emoji.replace_colons(content);
        updatedUserData[`response${updatedRoomData.topicRound}`] = content;
        updatedUserData.finished = true;
        userData = updatedUserData;
        roomData = updatedRoomData;
        sio.to(roomData.id).emit('roomEvent', {
            event: "waiting", users: updatedRoomData.users.filter(user => !user.finished).map(user => {
                return { username: user.name, hash: sha512(user.name) }
            })
        });
        if (!updatedRoomData.users.filter(user => !user.finished).length) {
            clearTimeout(submitTimeouts[roomData.id]);
            finishRound(updatedRoomData);
        }
    })
    socket.on("vote", (data) => {
        const updatedRoomData = getRoom(roomData.id);
        if (!updatedRoomData) return socket.emit('error', "couldnt find room");
        if (!updatedRoomData.voting) return socket.emit('error', "HOW.");
        const updatedUserData = updatedRoomData.users.find(user => user.name == userData.name);
        if (!updatedUserData) return socket.emit('error', "couldnt find user");
        /*
return {
                    username: user.topic2user,
                    title: user.topic2,
                    desc: user.response2
                }
        */
        const findUser = updatedRoomData.users.find(user => {
            return user.topic2user == data.username
        });
        if (!findUser) return socket.emit('error', "couldnt find who made that");
        updatedUserData.votedFor = { ...data, actual: findUser.name };

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
        if (!content || typeof content != "string") return socket.emit("error", "nice try")
        if (content.length > 256) return socket.emit('error', "Message too long!");

        content = emoji.replace_colons(content);
        content = content.replaceAll("/shrug", "¯\\_(ツ)_/¯")
        console.log(`[${roomData.id}] ${userData.name} > ${content}`);
        switch (content.split(" ")[0]) {
            case "/fumomote":
                content = (content + " ᗜˬᗜ").trim();
                break;
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
        sio.to(roomData.id).emit("leave", sha512(userData.name));
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
                sio.to(roomData.id).emit("leave", sha512(username));
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
const PORT = process.env.PORT || 10080;

server.listen(PORT, async () => {
    console.log(`Server Listening on port @${PORT}`)
})
