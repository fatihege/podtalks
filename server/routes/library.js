import express from 'express'
import {getBooks, getBook, deleteBook, postCreateBook} from '../controllers/library.js'
import {audioUpload} from '../lib/multer.js'

const router = express.Router()

router.get('/', getBooks)
router.get('/:id', getBook)
router.delete('/:id', deleteBook)
router.post('/create', audioUpload.fields([
    {name: 'image', maxCount: 1},
    {name: 'audio', maxCount: 1},
]), postCreateBook)

export default router