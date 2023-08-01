import {Schema, model} from 'mongoose'

const BookSchema = new Schema({
    image: String,
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: String,
    hits: {
        type: Number,
        default: 0,
    },
    audio: String,
}, {
    timestamps: true,
})

export default model('Book', BookSchema)