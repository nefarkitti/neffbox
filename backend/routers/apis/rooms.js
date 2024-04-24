import express from 'express';
const eRouter = express.Router()
import validator from 'express-validator';
import { getRoom, sio, usernameLimit, maxPlayers, rooms, calculateUserHash, sha512, simpleRandom, shuffle, allRounds } from '../../constants.js'
import imageType from 'image-type';
import sharp from 'sharp';

export function genUser(username, userToken, ip, userID) {
    return {
        id: userID,
        name: username,
        token: userToken,
        points: 0,
        finished: false,
        topic2: null,
        topic2user: null,
        response1: null,
        response2: null,
        votedFor: null,
        ipAddr: sha512(ip),
        guest: (userID == null)
    }
}

function randomID(length = 16) {
    var text = "";
    //var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const chars = "0123456789"
    for (var i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
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
        // what the hell why do you do it like this LMAO
        console.log(`Attempt ${attempts} at finding available room ID`);


        attempts++;
    }
    return -1;
}

function calculateBase64Size(base64String) {
    // Remove header information from the base64 string
    const base64WithoutHeader = base64String.split(',')[1];
    // Convert Base64 string to a binary array
    const binaryString = Buffer.from(base64WithoutHeader, 'base64');
    // Get the length of the binary array
    const bytes = binaryString.length;
    // Convert bytes to megabytes
    const megabytes = bytes / (1024 * 1024);
    return megabytes;
}


function isValidBase64(str) {
    if (typeof str !== 'string') return false;
    const regex = /^(data:image\/[a-zA-Z]+;base64,)/;
    return regex.test(str);
}

function uploadImage(req, res, capture) {
    const roomID = req.params.room;
    const roomData = getRoom(roomID);
    if (!roomData) return res.status(404).send("Couldn't find room.");
    const file = req.body.file;
    const extension = req.body.ext;
    const username = req.body.username;
    if (!file || file.length === 0) return res.status(400).send('Invalid file');
    if (!roomID || !file || !username) return res.status(400).send("Some parameters aren't set!");
    if (!extension && !capture) return res.status(400).send("Give an extension.");
    if (!isValidBase64(file)) return res.status(400).send("Invalid base64.")
    if (!file.startsWith("data")) return res.status(400).send("Invalid base64. (Doesn't start with data)");
    let base64ImageData = file.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64ImageData, 'base64');
    imageType(buffer).then(async type => {
        if (!type) return res.status(400).send('Invalid image file');
        if (!type.mime || !type.mime.startsWith('image')) return res.status(400).send('Invalid image file');
        if (extension != type.mime && !capture) return res.status(400).send("Extensions do not match!");
        if (type && type.ext && !['png', 'jpeg', 'gif', 'jpg'].includes(type.ext)) {
            // convert image
            try {
                const pngBuffer = await sharp(buffer).toFormat('png').toBuffer();
                base64ImageData = pngBuffer.toString('base64');
            } catch (e) {
                console.error(e)
                return res.status(500).send("Couldn't convert image.")
            }
        }
        const hash = sha512(base64ImageData)
        console.debug(`/upload - ${roomID} - ${hash} - ${capture}`);
        const findUser = roomData.users.find(user => {
            return user.name == username
        })
        if (!findUser) return res.status(403).send("you tried uploading a file, but you dont have access to the room");
        if (capture) {
            roomData.imgs.set(hash, {
                buffer: base64ImageData,
                extension: "image/png"
            });
        } else {
            findUser.file = hash;
            roomData.imgs.set(hash, {
                buffer: base64ImageData,
                extension: type.mime
            });
        }
        res.send(hash);
    }).catch(e => {
        res.sendStatus(500);
        console.error(e);
    });
}

function paginate(arr, size) { // stackoverflow saved me from getting a headache
    return arr.reduce((acc, val, i) => {
        let idx = Math.floor(i / size);
        let page = acc[idx] || (acc[idx] = []);
        page.push(val);
        return acc;
    }, [])
}

export function router(db) {
    /*eRouter.post('/create', validator.body('username').notEmpty().isString(), validator.body('password').notEmpty().isString(), (req, res) => {
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const username = req.body.username;
        if (!username || typeof username != 'string') res.status(400).send("Give a valid username!");
        if (username.length > usernameLimit) return res.status(413).send("Username is too long!");
        if (!username.length) return res.status(400).send("whar");*/
    // when guests are made, allow the username option again
    eRouter.get('', (req, res) => {
        let page = parseInt(req.query.page) || 1;
        if (isNaN(page)) page = 1;
        
        const roomsList = paginate(rooms.filter(room => room.status == "public").map(room => {
            return {
                host: room.host,
                code: room.id,
                players: `${room.users.length}/${maxPlayers}`
            }
        }), 8);
        //console.log(roomsList)
        if (page > roomsList.length) page = roomsList.length;
        const list = roomsList[page - 1];
        if (!list) return res.status(404).send("There are no rooms available.");
        res.json({page, maxPages: roomsList.length, rooms: list})
    })
    eRouter.post('/create', validator.body('password').notEmpty().isString(), (req, res) => {
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        if (!req.user) return res.sendStatus(401);
        const userData = db.prepare('SELECT username, user_id, shape FROM users WHERE user_id = ?').get(req.user.user_id);
        if (!userData) return res.sendStatus(401);
        const username = userData.username;
        const password = req.body.password;
        if (!password || typeof password != 'string') res.status(400).send("Give a valid password!");
        if (!password.length) return res.status(400).send("whar");
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userExists = rooms.find(room => room.users.find(user => user.token == calculateUserHash(ip, username, room.id)))
        if (userExists) return res.status(400).send("you are already in a room!");
        const roomID = generateUniqueRoomID().toString();
        if (roomID == -1) return res.sendStatus(500);
        const userToken = calculateUserHash(ip, username, roomID);
        let allPossibleRounds = JSON.parse(JSON.stringify(allRounds))
        let actualChosenRounds = []

        for (let i = 0; i < 3; i++) { // 3 times hopefully i cant test rn
            const rolled = allPossibleRounds[simpleRandom(allPossibleRounds.length)]
            actualChosenRounds.push(rolled)
            allPossibleRounds.splice(allPossibleRounds.indexOf(rolled), 1)
            // support for multiple different rounds
            // im sorry if this breaks something
        }
        let equipped = []
        if (!false) { // userData.guest
            equipped = db.prepare('SELECT filename, type, equip FROM userInv WHERE user_id = ? AND equip = 1').all(userData.user_id);
            equipped.push({
                type: "shape",
                value: userData.shape
            })
        }
        rooms.push({
            id: roomID,
            host: username,
            // config stuff
            maxRounds: 3,
            password,
            status: "private",
            type: "classic",
            // config stuff
            round: 0,
            topicRound: 1,
            started: false,
            voting: false,
            users: [{equipped, ...genUser(username, userToken, ip, userData.user_id)}],
            rounds: [...shuffle(actualChosenRounds), "IMAGE"],
            imgs: new Map(),
            banUsernames: [],
            banIPs: [] // hashed! don't worry!
        })
        return res.send({
            id: roomID,
            token: userToken
        });
    })

    eRouter.post('/:room/upload', validator.body('username').notEmpty().isString(), validator.body('ext').notEmpty().isString(), validator.body('file').notEmpty().isString(), (req, res) => {
        const roomID = req.params.room;
        if (!roomID) res.sendStatus(400);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        uploadImage(req, res, false)
    })

    eRouter.post(
        '/:room/join',
        //validator.body('username').notEmpty().isString(),
        (req, res) => {
            const roomID = req.params.room;
            if (!roomID) res.sendStatus(400);
            //const result = validator.validationResult(req);
            //if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
            if (!req.user) return res.sendStatus(401);
            const userData = db.prepare('SELECT username, user_id, shape FROM users WHERE user_id = ?').get(req.user.user_id);
            if (!userData) return res.sendStatus(401);
            const username = userData.username;
            //const username = req.body.username;
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if (!roomID || !username) return res.sendStatus(400);
            if (typeof roomID != "string" || typeof username != "string") return res.sendStatus(400);
            if (username.length > usernameLimit) return res.status(413).send("username too long!");
            if (!username.length) return res.status(400).send("whar");
            const roomData = getRoom(roomID)
            if (!roomData) return res.status(404).send("could not find room");
            if (roomData.users.length >= maxPlayers) return res.status(403).send(`there are too many players (${maxPlayers}) in the room`)
            if (roomData.started) return res.status(403).send("the room has already started a round");
            const userExists = roomData.users.find(user => user.name == username);
            if (userExists) return res.status(403).send("someone has the same username in that room!");
            const userInRoom = rooms.find(room => room.users.find(user => user.token == calculateUserHash(ip, username, room.id)))
            if (userInRoom) return res.status(400).send("you are already in a room!");
            if (roomData.banUsernames.includes(username)) return res.status(403).send("your username is banned from joining the room!");
            if (roomData.banIPs.includes(sha512(ip))) return res.status(403).send("you are banned from this room.");
            if (roomData.status == "private") {
                const password = req.body.password;
                if (!password) return res.sendStatus(400);
                if (!password.length) return res.sendStatus(400)
                if (password != roomData.password) return res.status(403).send("incorrect password");
            }
            const userToken = calculateUserHash(ip, username, roomID);
            let equipped = []
            if (!false) { // userData.guest
                equipped = db.prepare('SELECT filename, type, equip FROM userInv WHERE user_id = ? AND equip = 1').all(userData.user_id);
                equipped.push({
                    type: "shape",
                    value: userData.shape
                })
            }
            roomData.users.push({equipped, ...genUser(username, userToken, ip, userData.user_id)});
            return res.json({
                users: roomData.users.map(user => {
                    return { name: user.name, points: user.points, equipped: user.equipped, idHash: sha512(user.name) }
                }),
                host: roomData.host,
                token: userToken
            })
        }
    )

    eRouter.post('/:room/capture', validator.body('username').notEmpty().isString(), validator.body('file').notEmpty().isString(), (req, res) => {
        const roomID = req.params.room;
        if (!roomID) res.sendStatus(400);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const file = req.body.file;
        if (file && calculateBase64Size(file) > 2) return res.status(400).send("File too large!")
        uploadImage(req, res, true)
    })

    eRouter.get('/:room', (req, res) => {
        const roomID = req.params.room;
        if (!roomID) res.sendStatus(400);
        const roomData = getRoom(roomID);
        if (!roomData) return res.status(404).send("Room not found.");
        if (req.user && req.query.IClaimHost) {
            const userData = db.prepare('SELECT username FROM users WHERE user_id = ?').get(req.user.user_id);
            if (!userData) return res.sendStatus(401);
            if (roomData.host != userData.username) return res.sendStatus(403);
            /*let a = "";
            for (let i = 0; i < roomData.password.length; i++)  {
                a += "A";
            }*/
            return res.json({
                id: roomData.id,
                userCount: roomData.users.length,
                started: roomData.started,
                maxRounds: roomData.maxRounds,
                visibility: roomData.status,
                password: roomData.password,
                //type: roomData.type
            })
        } else {
            return res.json({
                id: roomData.id,
                userCount: roomData.users.length,
                visibility: roomData.status,
                started: roomData.started
            })
        }
    })
    eRouter.patch(
        '/:room/settings',
        validator.body('visibility').notEmpty().isString(),
        validator.body('password').notEmpty().isString(),
        validator.body('maxRounds').notEmpty().isNumeric(),
        //validator.body('roundType').notEmpty().isString(),
    (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const userData = db.prepare('SELECT username FROM users WHERE user_id = ?').get(req.user.user_id);
        if (!userData) return res.sendStatus(401);
        const roomID = req.params.room;
        if (!roomID) res.sendStatus(400);
        const roomData = getRoom(roomID);
        if (!roomData) return res.status(404).send("Room not found.");
        if (roomData.host != userData.username) return res.sendStatus(403);
        let { visibility, password, maxRounds } = req.body;
        if (!["public","unlisted","private"].includes(visibility)) return res.sendStatus(406);
        if (maxRounds > 10) return res.sendStatus(406);
        if (maxRounds == 0) return res.sendStatus(406);
        if (!password.length && visibility == "private") {
            password = "default"
        }
        if (roomData.maxRounds != maxRounds) {
            let allPossibleRounds = JSON.parse(JSON.stringify(allRounds)) // im sorry if this change breaks something @firee
            let actualChosenRounds = []
            roomData.maxRounds = maxRounds;
            for (let i = 0; i < maxRounds; i++) { // 3 times hopefully i cant test rn
                const rolled = allPossibleRounds[simpleRandom(allPossibleRounds.length)]
                actualChosenRounds.push(rolled)
                allPossibleRounds.splice(allPossibleRounds.indexOf(rolled), 1)
                // support for multiple different rounds
                // im sorry if this breaks something
            }
            roomData.rounds = [...shuffle(actualChosenRounds), "IMAGE"];
        }
        roomData.password = password;
        roomData.status = visibility;
        //roomData.type
        res.sendStatus(200);
    })

    eRouter.get('/:room/imgs/:hash', validator.query("room").notEmpty().isInt(), validator.query("hash").notEmpty().isString(), (req, res) => {
        const hash = req.params.hash;
        const room = req.params.room;
        const roomData = getRoom(room);
        if (!roomData) return res.status(404).send("Room not found.");

        // Check if the hash exists in the storage
        if (!roomData.imgs.has(hash)) return res.status(404).send('Image not found');

        // Retrieve the image buffer from storage
        const { buffer, extension } = roomData.imgs.get(hash);

        // Set the appropriate content type and send the image buffer
        res.set('Content-Type', extension); // Change the content type according to your image type
        res.send(Buffer.from(buffer, 'base64'));
    });
    return eRouter;
};

/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⣄⣤⣤⣤⣤⣼⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀
⠀⠀⠀⠀⣠⣾⣿⣻⡵⠖⠛⠛⠛⢿⣿⣶⣴⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠏⢷⡄⠀⠀⠀
⠀⣤⣤⡾⣯⣿⡿⠋⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣷⣤⣴⣾⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠏⠀⠈⢻⣦⡀⠀
⠀⢹⣿⣴⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣿⣄⡀⢀⣤⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣶⠀⠈⠻⣦⠀⠀⣼⠋⠀⠀
⠀⣼⢉⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣿⣥⠤⠴⣶⣶⣶⣶⣶⣶⣶⣶⣾⣿⠿⣿⣿⣿⣿⡇⣸⠋⠻⣿⣷
⢰⡏⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣶⣶⣿⣟⣿⣟⣛⣭⣉⣩⣿⣿⡀⣼⣿⣿⣿⣿⣿⣄⠀⣸⣿
⢿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⣿⣿⣿⠿⠿⠛⠛⠛⠛⠛⠻⣿⣿⣭⣉⢉⣿⣿⠟⣰⣿⡟
⠈⣷⠸⣇⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡴⠞⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠀⠀⠉⣿⣿⡏⢀⣿⡟⠀
⠀⠹⣦⣿⣿⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠞⠋⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣀⠀⠀⠀⠀⣼⣿⡿⢫⣿⣿⡁⠀
⠀⠀⠀⠙⣿⡿⣿⣿⣷⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠁⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠿⢯⡈⠙⣧⡀⠀⠀⣿⣄⣴⣿⣿⠉⠻⣦
⠀⠀⠀⠰⠿⠛⠛⠻⣿⣿⣿⣷⣦⣀⠀⠀⠀⠀⠀⠀⣴⠏⠀⠀⠀⠀⠀⠀⠀⣰⣿⠉⠀⠀⠀⠚⣷⠀⠘⡇⠀⠀⠀⠙⠛⠉⠁⠀⠀⠈
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣹⣿⣽⡿⣿⣷⣦⣀⠀⠀⢰⡟⠀⠀⠀⠀⠀⠀⠀⠀⣿⠽⣄⠀⠀⠀⣠⠟⠀⢀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠙⠻⣿⣿⣟⣷⣦⣼⡇⠀⠀⠀⠀⠀⠀⠀⠀⠛⢧⡉⠛⠛⠛⠁⠀⣠⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡟⢉⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠳⠶⠶⠶⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠈⠉⠉⠉⣻⣿⣇⡀⠀⠀⠀⠀⠀⣤⡶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣄⠀⣠⣾⡿⠁⠙⢷⣦⣦⣤⣴⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣴⠶⣆⠀⠀⠀⣾⠉⢻⣿⣿⡀⠀⠀⢿⣿⢉⡿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣿⠁⢠⡟⠀⠀⠀⣿⠀⠘⣯⠉⠃⠀⠀⠈⢁⣸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣀⣼⡿⠀⠘⣷⠀⠀⠀⣿⠀⠀⢻⡶⠞⢛⡶⠚⢻⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⡾⠋⠁⣀⠀⠀⠈⠳⣄⠀⢸⡆⠀⠈⢷⣄⠟⢁⣠⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⡇⠀⠀⠈⢻⡄⠀⠀⠘⢷⣤⣷⡀⠀⠀⠙⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣧⠀⠀⠀⠀⣿⡀⠀⠀⠀⠈⢻⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢹⣄⠀⠀⢀⣿⠁⡀⠀⠀⠀⠀⠻⢷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠉⠛⠛⠛⠉⠻⣿⡦⠀⠀⠀⠀⠈⢻⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡇⠀⠀⠀⠀⠀⠀
*/
