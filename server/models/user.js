import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    image: String,
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    admin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

export default model('User', UserSchema)