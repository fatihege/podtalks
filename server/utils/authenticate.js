import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import {encrypt} from './encryption.js'

export default async (email, password, isPasswordEncrypted = false, userRecord = null) => {
    try {
        if (!email?.trim()?.length || !password?.length) return 1

        const user = (!userRecord || !userRecord._id) ? await User.findOne({email}) : userRecord
        if (!user) return 2

        const encryptedPassword = !isPasswordEncrypted ? encrypt(password) : password
        if (encryptedPassword !== user.password) return 3

        return {
            token: jwt.sign({userId: user._id}, process.env.JWT_KEY, {
                expiresIn: '1d',
            }),
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
            accepted: user.accepted,
            admin: user.admin,
            dateOfBirth: user.dateOfBirth,
            createdAt: user.createdAt,
            profileColor: user.profileColor,
            accentColor: user.accentColor,
        }
    } catch (e) {
        return e
    }
}