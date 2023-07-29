import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {Server} from 'socket.io'
import {createServer} from 'http'
import mongoose from 'mongoose'
import userRoutes from './routes/user.js'
import 'dotenv/config'
import {join} from 'path'
import fs from 'fs'
import checkDir from './utils/check-dir.js'
import {__dirname} from './utils/dirname.js'
import User from './models/user.js'
import randomRGB from './utils/random-rgb.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

const rooms = {}
const bufferHeaders = {}
let micClosedRoom = []

io.on('connection', socket => {
    const socketColor = randomRGB()

    socket.emit('color', socketColor)

    socket.on('disconnect', () => {
        socket.leave(Object.keys(rooms).find(room => rooms[room] === socket.id))
    })

    socket.on('voiceBufferHead', (streamerId, packet) => {
        if (!bufferHeaders[streamerId]) bufferHeaders[streamerId] = packet
        socket.broadcast.to(streamerId).emit('voiceBufferHead', packet)
    })

    socket.on('voiceBuffer', (streamerId, packet) => {
        if (rooms[streamerId]?.mic) socket.broadcast.to(streamerId).emit('voiceBuffer', packet)
    })

    socket.on('createStreamRoom', id => {
        if (!rooms[id]) rooms[id] = {
            id,
            mic: true,
            chat: true,
        }
        socket.join(id)
        if (!rooms[id]?.mic) socket.emit('micClosed')
        if (!rooms[id]?.chat) socket.emit('chatClosed')
    })

    socket.on('joinStreamRoom', (userId, userName, streamerId) => {
        if (!rooms[streamerId]) return
        socket.join(streamerId)
        if (bufferHeaders[streamerId]) socket.emit('voiceBufferHead', bufferHeaders[streamerId])
        if (!rooms[streamerId]?.mic) socket.emit('micClosed')
        if (!rooms[streamerId]?.chat) socket.emit('chatClosed')
        if (userId) socket.to(streamerId).emit('userJoined', userId, userName, socketColor)
    })

    socket.on('leaveStreamRoom', streamerId => {
        socket.leave(streamerId)
    })

    socket.on('updateStream', (userId, userName, stream) => {
        socket.to(userId).emit('updateStream', userId, userName, stream)
    })

    socket.on('closeStream', id => {
        socket.broadcast.to(id).emit('closeStream')
    })

    socket.on('sendMessage', (userId, userName, message, streamerId) => {
        if (!rooms[streamerId]?.chat && userId !== streamerId) return
        socket.broadcast.to(streamerId).emit('sendMessage', userId, userName, message, socketColor)
    })

    socket.on('micClosed', (streamerId) => {
        if (rooms[streamerId]?.mic) rooms[streamerId].mic = false
        socket.broadcast.to(streamerId).emit('micClosed')
    })

    socket.on('micOpened', (streamerId) => {
        if (!rooms[streamerId]?.mic) rooms[streamerId].mic = true
        socket.broadcast.to(streamerId).emit('micOpened')
    })

    socket.on('chatClosed', (streamerId) => {
        if (rooms[streamerId]?.chat) rooms[streamerId].chat = false
        socket.broadcast.to(streamerId).emit('chatClosed')
    })

    socket.on('chatOpened', (streamerId) => {
        if (!rooms[streamerId]?.chat) rooms[streamerId].chat = true
        socket.broadcast.to(streamerId).emit('chatOpened')
    })
})

app.use(bodyParser.json())
app.use(cors())

app.use('/user', userRoutes)

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

app.get('/', (req, res) => {
    res.json({message: 'Hello World!'})
})

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Connected to MongoDB')

        server.listen(process.env.PORT, () => {
            console.log(`Server listening on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error('Unable to connect MongoDB:', err.message))