import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {createServer} from 'http'
import mongoose from 'mongoose'
import userRoutes from './routes/user.js'
import podcasterRoutes from './routes/podcaster.js'
import articlesRoutes from './routes/articles.js'
import 'dotenv/config'
import {join} from 'path'
import fs from 'fs'
import checkDir from './utils/check-dir.js'
import {__dirname} from './utils/dirname.js'
import io from './lib/socket.io.js'

const app = express()
const server = createServer(app)

app.use(bodyParser.json())
app.use(cors())

app.use('/api/user', userRoutes)
app.use('/api/podcaster', podcasterRoutes)
app.use('/api/articles', articlesRoutes)

app.get('/image/:image', (req, res) => {
    const {image} = req.params
    const dir = join(__dirname, '..', 'images')
    const imagePath = join(dir, image)

    checkDir(dir)

    if (!fs.existsSync(imagePath)) return res.status(404).json({
        status: 'NOT FOUND',
    })

    res.setHeader('Cache-Control', 'public, max-age=86400')
    const stream = fs.createReadStream(imagePath)
    stream.pipe(res)
})

app.get('/api', (req, res) => {
    res.status(200).json({message: 'Hello there!'})
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