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
import randomRGB from './utils/random-rgb.js'
import User from './models/user.js'

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

io.on('connection', socket => {
    const socketColor = randomRGB()

    socket.emit('color', socketColor)

    socket.on('disconnect', () => {
        const roomId = Object.keys(rooms).find(room => rooms[room]?.listeners?.find(listener => listener.socketId === socket.id))
        if (roomId) {
            socket.leave(roomId)
            if (rooms[roomId]) {
                rooms[roomId].listeners = rooms[roomId].listeners.filter(listener => listener.socketId !== socket.id)
                socket.to(roomId).emit('updateListeners', rooms[roomId].listeners)
            }
        }
    })

    socket.on('getListeners', roomId => {
        if (rooms[roomId]) socket.emit('updateListeners', rooms[roomId].listeners)
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
            listeners: [],
        }
        socket.join(id)
        if (!rooms[id]?.mic) socket.emit('micClosed')
        if (!rooms[id]?.chat) socket.emit('chatClosed')
        socket.emit('updateListeners', rooms[id].listeners)
    })

    socket.on('joinStreamRoom', async (userId, userName, streamerId) => {
        if (!rooms[streamerId]) return
        socket.join(streamerId)

        if (bufferHeaders[streamerId]) socket.emit('voiceBufferHead', bufferHeaders[streamerId])
        if (!rooms[streamerId]?.mic) socket.emit('micClosed')
        if (!rooms[streamerId]?.chat) socket.emit('chatClosed')
        if (userId) socket.to(streamerId).emit('userJoined', userId, userName, socketColor)

        const user = await User.findById(userId, {password: 0}).populate('lastListened')
        await new Promise(async resolve => {
            if (user) {
                if (userId === streamerId) return resolve()
                if (Array.isArray(rooms[streamerId].listeners) && !rooms[streamerId].listeners.find(l => l.id === userId)) {
                    rooms[streamerId].listeners.push({
                        socketId: socket.id,
                        id: user._id.toString(),
                        name: user.name,
                        image: user.image,
                    })
                }
                if (!user.lastListened) user.lastListened = []
                if (user.lastListened?.find(l => l._id.toString() === streamerId)) return resolve()
                user.lastListened?.unshift(streamerId)
                if (user.lastListened?.length > 20) user.lastListened?.slice(0, 20)
                await user.save()
                resolve()
            }
        })

        socket.to(streamerId).emit('updateListeners', rooms[streamerId].listeners)
        socket.emit('updateListeners', rooms[streamerId].listeners)

        const streamer = await User.findById(streamerId)
        if (streamer && rooms[streamerId].listeners?.length && rooms[streamerId].listeners?.length > streamer.hits) {
            streamer.hits++
            await streamer.save()
        }
    })

    socket.on('leaveStreamRoom', streamerId => {
        socket.leave(streamerId)
    })

    socket.on('updateStream', (userId, userName, stream) => {
        socket.to(userId).emit('updateStream', userId, userName, stream)
    })

    socket.on('closeStream', id => {
        socket.broadcast.to(id).emit('closeStream')
        delete rooms[id]
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
    res.status(200).json({message: 'Hello there!'})
})

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Connected to MongoDB')

        server.listen(process.env.PORT, () => {
            console.log(`Server listening on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.error('Unable to connect MongoDB:', err.message))