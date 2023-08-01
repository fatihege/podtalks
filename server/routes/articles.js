import express from 'express'
import {getArticles, getArticle, deleteArticle, postCreateArticle} from '../controllers/articles.js'
import {apUpload} from '../lib/multer.js'

const router = express.Router()

router.get('/', getArticles)
router.get('/:id', getArticle)
router.delete('/:id', deleteArticle)
router.post('/create', apUpload.single('image'), postCreateArticle)

export default router