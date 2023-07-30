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
    bio: String,
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    stream: {
        type: Object,
        default: null,
    },
    lastListened: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    hits: {
        type: Number,
        default: 0,
    },
    bannedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    activated: {
        type: Boolean,
        default: false,
    },
    activationToken: String,
    passwordResetToken: String,
}, {
    timestamps: true,
})

export default model('User', UserSchema)