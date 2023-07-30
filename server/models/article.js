import {Schema, model} from 'mongoose'

const ArticleSchema = new Schema({
    image: String,
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    hits: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
})

export default model('Article', ArticleSchema)