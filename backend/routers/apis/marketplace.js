import express from 'express';
const eRouter = express.Router()
import validator from 'express-validator';
import fs from 'fs'
import seedrandom from 'seedrandom';
import moment from 'moment'
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const marketplace = loadJSON('../../marketplace.json')

function getRandomIntSeed(addSeed, min, max) {
    const currentDate = moment.utc().format("ddd MMM D YYYY")
    const seed = Math.abs(currentDate.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0,0)) + addSeed;
    min = Math.ceil(min);
    max = Math.floor(max);
    const rng = seedrandom(seed);
    return Math.floor(rng() * (max - min + 1)) + min;
}

export function shuffleSeed(addSeed, array) {
    const currentDate = new Date().toDateString();
    const seed = Math.abs(currentDate.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0,0)) + addSeed;
    const rng = seedrandom(seed);
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * i); // no +1 here!
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

export function router(db) {
    eRouter.post('/buy/:filename', (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const filename = req.params.filename;
        const item = marketplace.find(i => i.filename == filename);
        if (!item) return res.sendStatus(404);
        const isBundle = item.type == "bundle";
        const userData = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.user_id);
        if (!userData) return res.sendStatus(401);
        if (userData.points < item.points) return res.status(403).send("you're too poor!");
        if (isBundle) {
            const currentInv = db.prepare(`SELECT filename FROM userInv WHERE user_id = ?`).pluck().all(req.user.user_id);
            if (currentInv.filter(filename => item.items.includes(filename)).length >= item.items.length) return res.status(403).send("you already have the item!");
            db.prepare('UPDATE users SET points = points - ? WHERE user_id = ?').run(item.price, req.user.user_id);
            for (let i = 0; i < item.items.length; i++) {
                const name = item.items[i];
                const bundleItem = marketplace.find(i => i.filename == name);
                if (bundleItem) {
                    if (!currentInv.filter(filename => name == filename).length) {
                        db.prepare('INSERT INTO userInv (user_id, filename, type) VALUES (?, ?, ?)').run(req.user.user_id, bundleItem.filename, bundleItem.type);
                    }
                }
                
            }
            res.sendStatus(200);
        } else {
            const hasItem = db.prepare('SELECT count(*) FROM userInv WHERE user_id = ? AND filename = ?').pluck().get(req.user.user_id, filename);
            if (hasItem > 0) return res.status(403).send("you already have the item!");
            db.prepare('UPDATE users SET points = points - ? WHERE user_id = ?').run(item.price, req.user.user_id);
            db.prepare('INSERT INTO userInv (user_id, filename, type) VALUES (?, ?, ?)').run(req.user.user_id, filename, item.type);
            res.sendStatus(200);
        }
    })
    eRouter.post('/shape', validator.body('shape').notEmpty().isInt(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const shape = parseInt(req.body.shape);
        if (shape > 2 || shape < 0) return res.status(403).send("no")
        db.prepare('UPDATE users SET shape = ? WHERE user_id = ?').run(shape, req.user.user_id);
        res.sendStatus(200);
    })
    eRouter.post('/colour', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        const hasItem = db.prepare('SELECT count(*) FROM userInv WHERE user_id = ? AND filename = ? AND type = ?').pluck().get(req.user.user_id, name, "bases");
        if (!hasItem) return res.status(403).send("you don't have the colour!");
        db.prepare('UPDATE userInv SET equip = 0 WHERE user_id = ? AND type = ?').run(req.user.user_id, "bases");
        db.prepare('UPDATE userInv SET equip = 1 WHERE user_id = ? AND type = ? AND filename = ?').run(req.user.user_id, "bases", name);
        res.sendStatus(200);
    })
    function wearItem(req, res, type, name, allowMulti) {
        const hasItem = db.prepare('SELECT count(*) FROM userInv WHERE user_id = ? AND filename = ? AND type = ?').pluck().get(req.user.user_id, name, type);
        if (!hasItem) return res.status(403).send("you don't have the item!");
        if (!allowMulti) db.prepare('UPDATE userInv SET equip = 0 WHERE user_id = ? AND type = ?').run(req.user.user_id, type);
        db.prepare('UPDATE userInv SET equip = 1 WHERE user_id = ? AND type = ? AND filename = ?').run(req.user.user_id, type, name);
        res.sendStatus(200);
    }
    function removeItem(req, res, type, name, allowMulti) {
        const hasItem = db.prepare('SELECT count(*) FROM userInv WHERE user_id = ? AND filename = ? AND type = ?').pluck().get(req.user.user_id, name, type);
        if (!hasItem) return res.status(403).send("you don't have the item!");
        db.prepare('UPDATE userInv SET equip = 0 WHERE user_id = ? AND type = ? AND filename = ?').run(req.user.user_id, type, name);
        res.sendStatus(200);
    }
    eRouter.post('/wear/mouth', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        wearItem(req, res, "mouth", name, false)
    })
    eRouter.post('/wear/eye', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        wearItem(req, res, "eye", name, false)
    })
    eRouter.post('/wear/cosmetic', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        wearItem(req, res, "cosmetics", name, true)
    })
    eRouter.post('/removefromskin/mouth', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        removeItem(req, res, "mouth", name, false)
    })
    eRouter.post('/removefromskin/eye', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        removeItem(req, res, "eye", name, false)
    })
    eRouter.post('/removefromskin/cosmetics', validator.body('name').notEmpty().isString(), (req, res) => {
        if (!req.user) return res.sendStatus(401);
        const result = validator.validationResult(req);
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() })
        const { name } = req.body;
        removeItem(req, res, "cosmetics", name, true)
    })
    eRouter.get('', (req, res) => {
        if (!req.user) return res.sendStatus(401);
        // seed, min, max
        // change the 0 to whatever you want, like if its the 1st item, 2nd item, etc, you can put it in a for loop!
        let itemsAvailable = [];
        const currentPool = JSON.parse(JSON.stringify(marketplace)) // mutation is weird!
        for (let i = 0; i < 4; i++) { //wtf
            let roll = getRandomIntSeed(i, 0, 100)
            // what does getrandomintseed even return look in console
            // why isnt it displaying htem oh its getting the first item ok im stupid
            // it should be a random item of that rarity
            // still not dispalying wtf
            let rarity = "uncommon"
            console.log(roll)
            if (roll <= 65) {
                rarity = "rare"
            }
            if (roll <= 15) {
                rarity = "epic"
            }
            if (roll <= 4) {
                rarity = "legendary"
            }
            // is it even available
            //100% huh?
            const findItems = currentPool.filter(item => item.available && item.rarity == rarity);
            if (findItems.length) {
                const getItem = findItems[getRandomIntSeed(i, 0, findItems.length - 1)];
                // finditems is the pool
                // remove the item from finditems
                // then it rerolls without that item
                //dms
                itemsAvailable.push(getItem)
                currentPool.splice(currentPool.indexOf(getItem), 1);
            }
        }
        itemsAvailable = [...itemsAvailable, ...marketplace.filter(item => item.available && item.rarity == "common")] // could this be overwriting it?
        // yup now i have to fiugre out duplicates, hec!
        return res.json(itemsAvailable) // wait...
    })
    return eRouter;
}