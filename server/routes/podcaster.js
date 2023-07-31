import express from 'express'
import {getExplore} from '../controllers/podcaster.js'

const router = express.Router()

router.get('/explore', getExplore)

export default router