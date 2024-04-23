import crypto from 'crypto'
export const maxPlayers = 6;
export const usernameLimit = 10;
/*export let rooms = [{
    id: 12345,
    host: "Firee",
    // config stuff
    maxRounds: 3,
    password: "e",
    status: "public",
    type: "classic",
    // config stuff
    round: 0,
    topicRound: 1,
    started: false,
    voting: false,
    users: [{}],
    imgs: new Map(),
    banUsernames: [],
    banIPs: [] // hashed! don't worry!
}];
rooms = [rooms[0], rooms[0], rooms[0], rooms[0], rooms[0], rooms[0], rooms[0], rooms[0], rooms[0], rooms[0], rooms[0]]*/
export let rooms = [];
export function getRoom(id) {
    if (!id) return null;
    return rooms.find(room => room.id.toString() == id.toString());
}

export const allRounds = ["RATINGS", "NEWS", "TRAVELLING", "SHOPPING", "GOFUNDME", "VIDEO"] 

export const sha512 = (str) => crypto.createHash('sha512').update(str).digest('hex');

const uniqueKey = crypto.randomBytes(16).toString('hex');

export function calculateUserHash(ip, username, id) {
    const evenMoreUniqueKey = crypto.randomBytes(32).toString('hex');
    // best security
    //return sha512(`${uniqueKey}${ip}${req.headers['user-agent']}${username}${id}`)
    return sha512(`${uniqueKey}${ip}${username}${id}${evenMoreUniqueKey}`)
}

export function simpleRandom(max) {
    return Math.floor(Math.random() * max);
}

export function shuffleNoCollide(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * i); // no +1 here!
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

export function shuffle(array) {
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


import http from 'http';
import express from 'express';
export const app = express();
export const server = http.createServer(app);
import { Server } from 'socket.io'
export const sio = new Server(server, {
    cors: {
        origin: "*"
    }
});

/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠋⠁⠀⢉⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣀⡤⠦⠙⠀⠀⠀⠀⠉⠉⠉⡉⠓⠦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣞⡵⠚⠂⠀⠀⠀⠀⠀⠀⠀⠀⠉⠳⢤⡞⠃⠀⠀⠀⢀⣠⣤⢶⡶⣶⡶⣤⣀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡴⣿⢦⢆⣀⣶⡄⠀⣀⡀⠀⠀⡆⡀⠀⠀⢹⣂⡴⢶⣴⣿⣿⣶⣶⣿⣿⣿⣾⣿⣿⡦⠀⠀
⠀⠀⠀⠀⣸⡟⢱⠏⡾⡽⡾⠀⡼⡽⠋⠀⣼⢡⡏⢸⠀⣲⣻⣿⣿⣿⣿⣿⣿⣿⠿⣿⠿⢿⡿⣿⣿⣶⡀
⠀⠀⠀⠀⢿⡀⢿⣤⡇⡇⠇⣰⣿⣥⡀⣼⢣⣯⣤⡼⢰⡇⣇⣿⣿⣿⣿⣿⡛⠉⠀⠀⠀⠀⠀⠈⣽⣷⡇
⠀⠀⠀⠀⠀⢰⠛⠻⡦⠉⠀⣿⣿⣿⡗⠳⢿⣿⣿⣿⢞⢀⠿⠛⣿⡿⣿⡣⠥⣄⣀⡀⠀⢀⣀⣠⡍⣿⡏
⠀⠀⠀⠀⠀⠈⠓⠶⠶⡄⠀⠈⠉⠉⠀⠀⠀⠉⠉⠁⠈⣷⠉⢱⣏⠙⢮⠀⠀⠀⠉⠁⠀⠈⠀⠀⡦⢿⡇
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣹⡂⠀⠀⠀⣀⡀⣀⣀⣠⣴⠾⠃⠀⠀⠉⠙⠻⣦⡀⠀⠀⠀⠀⠀⠀⢀⡽⠊⠃
⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣷⣶⣭⡍⠉⠉⠀⠀⠀⠀⠀⠀⠀⠠⣤⣿⡀⠀⠀⠀⢀⣠⠴⠋⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⣶⣞⡋⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⡟⣿⡇⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣗⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⡧⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣼⣿⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀
⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀
⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀
⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀
⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀
⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀
⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀
⠸⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠀⠀⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠀⠀⠀
*/