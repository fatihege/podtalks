import jwt from 'jsonwebtoken'
import fs from 'fs'
import {join} from 'path'
import checkEmail from '../utils/check-email.js'
import {encrypt} from '../utils/encryption.js'
import User from '../models/user.js'
import authenticate from '../utils/authenticate.js'
import {__dirname} from '../utils/dirname.js'
import {checkPassword, checkUserName} from '../utils/checkers.js'

const returnErrors = (errors, res) => {
    if (errors.length) {
        res.status(400).json({
            status: 'ERROR',
            errors,
        })
        return true
    }

    return false
}

const getFollowers = async (userId, count = true) => {
    const query = {following: {$in: [userId]}}
    const projection = {name: 1, email: 1, image: 1}
    return count ? await User.countDocuments(query) : await User.find(query, projection)
}

export const getUser = async (req, res) => {
    try {
        const {token} = req.params
        const {id, props} = req.query

        if (!token && !id) return res.status(400).json({
            status: 'ERROR',
            message: 'Token ya da ID gerekli.',
        })

        let userId = null

        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_KEY)

            if (!decodedToken.userId) return res.status(404).json({
                status: 'ERROR',
                message: 'Token\'in süresi doldu.',
            })

            userId = decodedToken.userId
        } else userId = id

        const user = await User.findById(userId, {password: 0}).populate('following', 'name email image')

        if (!user || !user._id) return res.status(404).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        let result = {}

        if (props && props.split(',').length) {
            for (let prop of props.split(',')) {
                const propName = prop.trim().startsWith('count:') ? prop.trim().slice('count:'.length).trim() : prop.trim()
                if (propName === 'followers') {
                    result[propName] = await getFollowers(user._id, prop.trim().startsWith('count:'))
                } else if (typeof user[propName] !== 'undefined' && !prop.includes('password'))
                    result[propName] = prop.startsWith('count:') ? user[propName]?.length : user[propName]
            }
        } else result = {
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
            admin: user.admin,
            createdAt: user.createdAt,
        }

        res.status(200).json({
            status: 'OK',
            user: result,
        })
    } catch (e) {
        res.status(e.message === 'jwt expired' ? 404 : 500).json({
            status: 'ERROR',
            message: e?.message?.includes('jwt') ? 'Token\'in süresi doldu.' : 'Kullanıcı bilgileri alınırken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const postRegisterUser = async (req, res) => {
    try {
        const {name, email, password, passwordConfirm} = req.body
        const errors = []

        if (!email?.trim().length) errors.push({
            field: 'email',
            message: 'Bir e-posta adresi girin.',
        })
        else if (!checkEmail(email)) errors.push({
            field: 'email',
            message: 'Girdiğiniz e-posta adresi geçersiz.',
        })

        if (!name?.trim().length) errors.push({
            field: 'name',
            message: 'Bir isim girin.',
        })
        else if (!checkUserName(name)) errors.push({
            field: 'name',
            message: 'Girdiğiniz isim çok kısa.',
        })

        if (!password?.length) errors.push({
            field: 'password',
            message: 'Bir şifre girin.',
        })
        else if (!checkPassword(password)) errors.push({
            field: 'password',
            message: 'Girdiğiniz şifre çok kısa.',
        })

        if (!passwordConfirm?.length) errors.push({
            field: 'passwordConfirm',
            message: 'Şifrenizi onaylayın.',
        })
        else if (password !== passwordConfirm) errors.push({
            field: 'passwordConfirm',
            message: 'Girdiğiniz şifreler eşleşmiyor.',
        })

        const foundUser = await User.findOne({email})

        if (foundUser) errors.push({
            field: 'email',
            message: 'Bu e-posta adresine ait bir kullanıcı var.',
        })

        if (returnErrors(errors, res)) return

        const encryptedPassword = encrypt(password)
        const count = await User.count({})
        const user = new User({name, email, password: encryptedPassword, admin: !count})

        await user.save()

        const auth = await authenticate(email, password)

        res.status(201).json({
            status: 'OK',
            message: 'Kullanıcı oluşturuldu.',
            user: {...auth},
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Kullanıcı oluşturulurken bir hata meydana geldi.',
        })
    }
}

export const postLoginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        const errors = []

        if (!email?.trim().length) errors.push({
            field: 'email',
            message: 'Bir e-posta adresi girin.',
        })
        else if (!checkEmail(email)) errors.push({
            field: 'email',
            message: 'Girdiğiniz e-posta adresi geçersiz.',
        })

        if (!password?.length) errors.push({
            field: 'password',
            message: 'Şifrenizi girin.',
        })

        if (returnErrors(errors, res)) return

        const user = await User.findOne({email})
        let encryptedPassword

        if (!user) errors.push({
            field: 'email',
            message: 'Bu bilgilere ait bir kullanıcı bulunamadı.',
        })
        else {
            encryptedPassword = encrypt(password)
            if (encryptedPassword !== user.password) errors.push({
                field: 'password',
                message: 'Girdiğiniz şifre yanlış.',
            })
        }

        if (returnErrors(errors, res)) return

        const auth = await authenticate(email, encryptedPassword || user.password, !!encryptedPassword, user)

        res.status(200).json({
            status: 'OK',
            message: 'Yetkilendirildi.',
            user: {...auth},
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Kullanıcı yetkilendirilirken bir hata meydana geldi.',
        })
    }
}

export const postUpdateProfile = async (req, res) => {
    try {
        const {id} = req.params
        const image = req.file
        const {name, noImage} = req.body

        if (!id) return res.status(400).json({
            status: 'ERROR',
            message: 'ID verisi gereklidir.',
        })

        const user = await User.findById(id)

        if (!user) return res.status(404).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        let newName = user.name
        let newImage = user.image

        const currentImagePath = join(__dirname, '..', 'images', user.image || '_')
        if (user.image && fs.existsSync(currentImagePath)) fs.unlinkSync(currentImagePath)

        if (checkUserName(name)) newName = name
        if (image) newImage = image.filename
        if (noImage) newImage = null

        user.name = newName
        user.image = newImage

        await user.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Kullanıcı profili güncellendi.',
            image: newImage,
            name: newName,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Kullanıcı profili güncellenirken bir hata meydana geldi.',
            error: e.message,
        })
    }
}


export const postUpdateUser = async (req, res) => {
    try {
        const {id} = req.params
        const {name, email, currentPassword, newPassword, passwordConfirm} = req.body

        if (!id) return res.status(400).json({
            status: 'ERROR',
            message: 'ID verisi gereklidir.',
        })

        const user = await User.findById(id)

        if (!user) return res.status(404).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        if (name && email) {
            const errors = []
            let newName = user.name
            let newEmail = user.email

            if (checkUserName(name)) newName = name
            if (checkEmail(email)) newEmail = email

            if (!name?.trim().length) errors.push({
                field: 'name',
                message: 'Bir isim girin.',
            })
            else if (!checkUserName(name)) errors.push({
                field: 'name',
                message: 'Girdiğiniz isim çok kısa.',
            })
            else newName = name

            if (!email?.trim().length) errors.push({
                field: 'email',
                message: 'Bir e-posta adresi girin.',
            })
            else if (!checkEmail(email)) errors.push({
                field: 'email',
                message: 'Girdiğiniz e-posta adresi geçersiz.',
            })
            else newEmail = email

            if (returnErrors(errors, res)) return

           
            user.name = newName
            user.email = newEmail

            await user.save()

            return res.status(200).json({
                status: 'OK',
                message: 'Kullanıcı bilgileri güncellendi.',
                name: newName,
                email: newEmail,
            })
        } else if (currentPassword && newPassword && passwordConfirm) {
            const errors = []

            if (!currentPassword?.length) errors.push({
                field: 'currentPassword',
                message: 'Şu anki şifrenizi girin.',
            })

            if (!newPassword?.length) errors.push({
                field: 'password',
                message: 'Yeni şifrenizi girin.',
            })
            else if (!checkPassword(newPassword)) errors.push({
                field: 'password',
                message: 'Yeni şifreniz çok kısa.',
            })

            if (!passwordConfirm?.length) errors.push({
                field: 'passwordConfirm',
                message: 'Yeni şifrenizi onaylayın.',
            })
            else if (newPassword !== passwordConfirm) errors.push({
                field: 'passwordConfirm',
                message: 'Girdiğiniz şifreler eşleşmiyor.',
            })

            if (returnErrors(errors, res)) return

            if (encrypt(newPassword) === user.password) errors.push({
                field: 'password',
                message: 'Yeni şifreniz eski şifrenizden farklı olmalı.'
            })

            const encryptedPassword = encrypt(currentPassword)

            if (user.password !== encryptedPassword) errors.push({
                field: 'currentPassword',
                message: 'Girdiğiniz şifre yanlış.',
            })

            if (returnErrors(errors, res)) return

            const newEncryptedPassword = encrypt(newPassword)
            if (newEncryptedPassword) {
                user.password = newEncryptedPassword
                await user.save()
                return res.status(200).json({
                    status: 'OK',
                    message: 'Şifreniz güncellendi.',
                })
            } else throw new Error()
        } else return res.status(400).json({
            status: 'ERROR',
            message: 'Hatalı istek.',
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Kullanıcı güncellenirken bir hata meydana geldi.',
            error: e.message,
        })
    }
}