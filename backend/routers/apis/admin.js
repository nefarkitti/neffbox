import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'express-validator';
const eRouter = express.Router()
import { getRoom, sio, rooms, calculateUserHash, sha512, simpleRandom, shuffle, allRounds } from '../../constants.js'
import { exec } from 'child_process';
import util from 'util'

export function router(db) {

    function isAdmin(user) {
        return ["Firee","nefarkitti"].includes(db.prepare('SELECT username FROM users WHERE user_id = ?').pluck().get(user.user_id));
    }

    // FIRST, CHECK IF ITS AN ADMIN! do it only after you finish ok\
    // TODO: VERY IMPORTANT! MAKE SURE TO IMPL AUTHETNICATION
    eRouter.get('', (req, res) => {
        //check auth
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        res.sendStatus(200)
    })
    eRouter.get('/stats', (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        const users = db.prepare('SELECT count(*) FROM users').pluck().get();
        console.log("[Admin] /stats")
        res.json({
            users,
            rooms: rooms.length,
            cosmetics: 0
        })
    })
    eRouter.post('/dev/eval', validator.body('query').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const code = req.body.query;
        console.log(`[Admin] /eval ${code}`)
        try {
            let evaled = eval(code);
            if (typeof evaled !== "string")
                evaled = util.inspect(evaled);
            res.json({ result: evaled })
        } catch (err) {
            res.json({error: err })
        }
        return true;
    })
    eRouter.post('/dev/shell', validator.body('query').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const cmd = req.body.query;
        console.log(`[Admin] /shell ${cmd}`)
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                return res.json({ error: true, result: { stderr } });
            }
            res.json({ result: { stdout } });
        });
    })

    
    eRouter.post('/dev/sql', validator.body('query').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const query = req.body.query;
        console.log(`[Admin] /sql ${query}`)
        try {
            const statement = db.prepare(query);
            const isSelectQuery = query.trim().toUpperCase().startsWith('SELECT') || query.trim().toUpperCase().startsWith('PRAGMA');

            let result;
            if (isSelectQuery) {
                result = statement.all();
            } else {
                result = statement.run();
            }

            // Send the result
            res.json({select: isSelectQuery, result});
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    eRouter.post("/user/:userID/username", (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        return res.sendStatus(400);
        const userData = sql.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.user_id);
        if (!userData) return res.sendStatus(401);
        const { username } = req.body;
        if ([username].includes(undefined)) return res.status(406).send('Missing username');
        if (username.length < 3) return res.status(406).send("Please enter in a username that is longer than 2 characters!");
        if (username.length > 10) return res.status(406).send("Please enter in a username that is less than than 10 characters!");
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(406).send("Usernames cannot contain any special characters! They can only contain letters, numbers, and an underscore.");
        const userExists = sql.prepare('SELECT count(*) FROM users WHERE username = ?').pluck().get(username);
        if (userExists) return res.status(409).send('Someone with that username already exists!');
        sql.prepare('UPDATE users SET username = ? WHERE user_id = ?').run(username, req.user.user_id);
        return res.sendStatus(200);
    })
    eRouter.post("/user/:userID/password", (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        return res.sendStatus(400);
        const userData = sql.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.user_id);
        if (!userData) return res.sendStatus(401);
        const { password } = req.body;
        if (!password) return res.sendStatus(406);
        if (password.length < 8) return res.status(406).send("Please enter in a password that is longer than 8 characters!");
        if (password.length > 1024) return res.status(406).send("calm down");
        return bcrypt.hash(`${userData.salt}.${password}`, 10, function(err, hash) {
            if (err) return res.status(500).send("An error occured while trying to hash the password.");
            db.prepare('UPDATE users SET password = ? WHERE user_id = ?').run(hash, req.user.user_id);
            res.sendStatus(200);
        })
    })
    eRouter.post("/user/:userID/delete", (req, res) => {
        if (!req.user) return res.sendStatus(401);
        if (!isAdmin(req.user)) return res.sendStatus(403);
        return res.sendStatus(400);
        //db.prepare('DELETE FROM users WHERE user_id = ?').run(req.user.user_id);
        res.sendStatus(403);
        //res.sendStatus(204);
    })
    return eRouter;
}