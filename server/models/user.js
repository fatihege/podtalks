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
    admin: {
        type: Boolean,
        default: false,
    },
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