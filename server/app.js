import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {createServer} from 'http'
import mongoose from 'mongoose'
import userRoutes from './routes/user.js'
import 'dotenv/config'
import {join} from 'path'
import fs from 'fs'
import checkDir from './utils/check-dir.js'
import {__dirname} from './utils/dirname.js'
import io from './lib/socket.io.js'
import User from './models/user.js'

const app = express()
const server = createServer(app)

app.use(bodyParser.json())
app.use(cors())

app.use('/api/user', userRoutes)

app.use('/api/podcaster/explore', async (req, res) => {
    try {
        const active = await User.find({activated: true, stream: {$ne: null}}, {
            password: 0,
            email: 0
        }).sort({hits: -1}).limit(30)
        const popular = await User.find({activated: true}, {password: 0, email: 0}).sort({hits: -1}).limit(30)
        const newbie = await User.find({activated: true}, {password: 0, email: 0}).sort({createdAt: -1}).limit(30)

        res.status(200).json({
            status: 'OK',
            message: 'Podcaster\'lar bulundu.',
            active,
            popular,
            newbie,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcaster\'lar aranırken bir hata oluştu.',
            error: e.message,
        })
    }
})

app.use('/api/podcaster/search/:query', async (req, res) => {
    try {
        const {query} = req.params

        const podcasters = await User.find({
            activated: true,
            $or: [{name: {$regex: query, $options: 'i'}}, {bio: {$regex: query, $options: 'i'}}]
        }, {password: 0, email: 0}).sort({hits: -1, createdAt: -1}).limit(50)

        res.status(200).json({
            status: 'OK',
            message: 'Podcaster\'lar bulundu.',
            podcasters,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcaster\'lar aranırken bir hata oluştu.',
            error: e.message,
        })
    }
})

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