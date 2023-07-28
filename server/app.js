import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {Server} from 'socket.io'
import {createServer} from 'http'
import mongoose from 'mongoose'
import userRoutes from './routes/user.js'
import 'dotenv/config'

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.use(bodyParser.json())
app.use(cors())


app.use('/user', userRoutes)

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