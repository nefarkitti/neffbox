// property of khaj//t
import express from 'express';
const eRouter = express.Router()
import { router as roomsRouter } from './apis/rooms.js'
import { router as userRouter } from './apis/user.js'
import { router as adminRouter } from './apis/admin.js'
import { router as marketRouter } from './apis/marketplace.js'

export function router(db) {
    eRouter.use(`/rooms`, roomsRouter(db));
    eRouter.use(`/user`, userRouter(db));
    eRouter.use(`/admin`, adminRouter(db));
    eRouter.use(`/marketplace`, marketRouter(db));
    return eRouter;
}