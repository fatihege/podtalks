import express from 'express'
import {getExplore, getSearch} from '../controllers/podcaster.js'

const router = express.Router()

router.get('/explore', getExplore)
router.get('/search/:query', getSearch)

export default router