import express from 'express'
import {getArticles, getArticle, deleteArticle, postCreateArticle} from '../controllers/articles.js'
import multer from '../lib/multer.js'

const router = express.Router()

router.get('/', getArticles)
router.get('/:id', getArticle)
router.delete('/:id', deleteArticle)
router.post('/create', multer.single('image'), postCreateArticle)

export default router