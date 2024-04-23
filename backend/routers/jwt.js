// property of khaj//t
import express from 'express';
const router = express.Router()
import { verifyToken } from './auth.js'
router.use(function(req, res, next) {
    if (!req.headers['authorization']) return next();
    verifyToken(req.headers['authorization']).then(user => {
        req.user = user;
        next()
    }).catch(err => {
        console.error(err);
        res.sendStatus(401);
    })
})
router.post('/verify', function(req, res) {
    if (!req.headers['authorization']) return res.sendStatus(401);
    if (req.user) return res.sendStatus(200);
    res.sendStatus(401);
})
export default router;