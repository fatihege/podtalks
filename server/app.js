import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {createServer} from 'http'
import mongoose from 'mongoose'
import userRoutes from './routes/user.js'
import podcasterRoutes from './routes/podcaster.js'
import articlesRoutes from './routes/articles.js'
import libraryRoutes from './routes/library.js'
import 'dotenv/config'
import {join} from 'path'
import fs from 'fs'
import checkDir from './utils/check-dir.js'
import {__dirname} from './utils/dirname.js'
import io from './lib/socket.io.js'
import User from './models/user.js'
import Article from './models/article.js'
import Book from './models/book.js'

const app = express()
const server = createServer(app)

app.use(bodyParser.json())
app.use(cors())

app.use('/api/user', userRoutes)
app.use('/api/podcaster', podcasterRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/library', libraryRoutes)
app.get('/api/search/:query', async (req, res) => {
    try {
        const {query} = req.params

        const podcasters = await User.find({
            activated: true,
            $or: [{name: {$regex: query, $options: 'i'}}, {bio: {$regex: query, $options: 'i'}}]
        }, {password: 0, email: 0}).sort({hits: -1, createdAt: -1}).limit(50)

        const articles = await Article.find({
            $or: [{title: {$regex: query, $options: 'i'}}, {content: {$regex: query, $options: 'i'}}]
        }, {title: 1, image: 1, content: {$substrCP: ['$content', 0, 50]}}).populate({
            path: 'creator',
            select: 'image name'
        }).sort({hits: -1, createdAt: -1}).limit(50)

        const books = await Book.find({
            $or: [{title: {$regex: query, $options: 'i'}}, {content: {$regex: query, $options: 'i'}}]
        }, {title: 1, image: 1, author: 1, content: {$substrCP: ['$content', 0, 50]}}).sort({hits: -1, createdAt: -1}).limit(50)

        res.status(200).json({
            status: 'OK',
            message: 'Sonuçlar bulundu.',
            podcasters,
            articles,
            books,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Sonuçlar aranırken bir hata oluştu.',
            error: e.message,
        })
    }
})
app.get('/api', (req, res) => {
    res.status(200).json({message: 'Hello there!'})
})

app.get('/uploads/:file', (req, res) => {
    const {file} = req.params
    const dir = join(__dirname, '..', 'public', 'uploads')
    const filePath = join(dir, file)

    checkDir(dir)

    if (!fs.existsSync(filePath)) return res.status(404).json({
        status: 'NOT FOUND',
    })

    res.setHeader('Cache-Control', 'public, max-age=86400')
    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
})

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Connected to MongoDB')

        server.listen(process.env.PORT, () => {
            console.log(`Server listening on port ${process.env.PORT}`)
        })

        try {
            io(server)
            console.log('Socket.io connected')
        } catch (err) {
            console.error('Unable to connect socket.io:', err.message)
        }
    })
    .catch(err => console.error('Unable to connect MongoDB:', err.message))