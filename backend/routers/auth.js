// property of khaj//t
import express from 'express';
const eRouter = express.Router()
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const secret_key = process.env.JWT_KEY
import ms from 'ms';
import { randomBytes } from 'crypto';

export function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret_key, (err, out) => {
            if (err) return reject(err)
            resolve(out)
        })
    })
}
/*
caribbeangreen
                                    crimson
                                    dodgerblue
                                    orange
                                    pizazz
                                    purpleheart
                                    redorange
                                    white
*/
const defaultColours = ["caribbeangreen", "crimson", "dodgerblue", "orange", "pizazz", "purpleheart", "redorange", "white"]

export function router(sql) {
    function createToken(user_id, res) {
        const token = jwt.sign(
            { user_id },
            secret_key,
            { expiresIn: '30d' }
        )
        return res.json({
            user_id,
            token
        });
    }
    eRouter.post('/auth', function(req, res) {
        if (req.user) return res.sendStatus(204);
        const { username, password } = req.body;
        if ([username, password].includes(undefined)) return res.status(406).send('Missing username or password');
        const userData = sql.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!userData) return res.status(404).send('Invalid username or password');
        return bcrypt.compare(`${userData.salt}.${password}`, userData.password, function(err, result) {
            if (err) return res.status(500).send('An error occurred while comparing the password');
            if (!result) return res.status(401).send('Invalid username or password');
            return createToken(userData.user_id, res);
        });
    })
    eRouter.post('/register', function(req, res) {
        if (req.user) return res.sendStatus(204);
        const { username, password } = req.body;
        if ([username, password].includes(undefined)) return res.status(406).send('Missing username and/or password');
        if (username.length < 3) return res.status(406).send("Please enter in a username that is longer than 2 characters!");
        if (username.length > 10) return res.status(406).send("Please enter in a username that is less than than 10 characters!");
        if (password.length < 6) return res.status(406).send("Please enter in a password that is longer than 6 characters!");
        if (password.length > 1024) return res.status(406).send("calm down");
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(406).send("Usernames cannot contain any special characters! They can only contain letters, numbers, and an underscore.");
        const userData = sql.prepare('SELECT count(*) FROM users WHERE username = ?').pluck().get(username);
        if (userData) return res.status(409).send('Someone with that username already exists!');
        const userSalt = randomBytes(32);
        return bcrypt.hash(`${userSalt.toString('hex')}.${password}`, 10, function(err, hash) {
            if (err) return res.status(500).send("An error occured while trying to hash the password.");
            const timestamp = Date.now()
            sql.prepare('INSERT INTO users (username, salt, password, createdIn, points, shape) VALUES (?, ?, ?, ?, 0, ?)')
                .run(username, userSalt.toString('hex'), hash, timestamp, Math.floor((Math.random() * 3)));
            const newUserData = sql.prepare('SELECT * FROM users WHERE username = ?').get(username);
            if (!newUserData) return res.status(500).send("An error occured while trying to get the user after creating it.");
            defaultColours.forEach(filename => {
                sql.prepare('INSERT INTO userInv (user_id, filename, type) VALUES (?, ?, ?)').run(newUserData.user_id, filename, "bases");
            })
            sql.prepare(`UPDATE userInv SET equip = 1 WHERE user_id = ?
            AND ROWID = ( SELECT ROWID FROM userInv WHERE user_id = ? ORDER BY RANDOM() LIMIT 1)`).run(newUserData.user_id, newUserData.user_id)
            console.log(`new user registered: ${username}`);
            return createToken(newUserData.user_id, res);
        })
    })
    return eRouter;
}

/*
i omor
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⣶⣶⣶⣶⣶⣶⣶⣦⣄⡀⠀⠐⡆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⣴⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣄⣼⡆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣷⡦⠄⣀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⠀⠈⠀⠀⠀⠀
⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠀⢰⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⡫⣁⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⡟⠃⣿⣿⣿⡟⠁⠀⠉⠛⠛⢻⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⣿⡿⢿⣿⣯⡽⠿⠛⠉⠀⠀⠀⣬⠽⢷⣶⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀
⠀⠀⠀⣠⠋⢀⠙⡏⠁⣀⣾⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⡇⠘⣿⢉⡄⠱⡄⠀⠀⠀
⠀⠀⠀⢇⠀⠲⣹⣿⠀⠀⠈⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠀⢸⡟⡡⠀⠠⠃⠀⠀⠀
⠀⠀⠀⠈⠱⢄⡈⠹⡆⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⢀⡎⠁⢀⠔⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠙⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠜⠉⠉⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠒⡀⠀⠀⠀⠀⠐⠒⠀⠀⠀⠀⢀⠖⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢢⣤⡀⠀⠀⠀⣠⣤⡎⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⢾⠿⣿⣿⣿⣿⣿⡿⣗⡆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠊⠘⡞⠀⠈⠙⠛⠛⠉⠀⢻⠇⠈⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣀⣀⣴⡿⠀⠀⠰⣀⠀⠀⠀⠀⠀⢠⠇⠀⠀⢹⣦⣄⣀⠀⠀⠀⠀⠀⠀⠀
*/