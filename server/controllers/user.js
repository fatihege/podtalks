import jwt from 'jsonwebtoken'
import fs from 'fs'
import {join} from 'path'
import checkEmail from '../utils/check-email.js'
import {encrypt} from '../utils/encryption.js'
import User from '../models/user.js'
import authenticate from '../utils/authenticate.js'
import {__dirname} from '../utils/dirname.js'
import {checkPassword, checkUserName} from '../utils/checkers.js'
import sendMail from '../utils/send-mail.js'

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

        const user = await User.findById(userId, {password: 0}).populate('following')

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
            activated: user.activated,
            stream: user.stream,
            following: user.following,
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

        const activationToken = jwt.sign({email}, process.env.JWT_KEY, {expiresIn: '1h'})
        const encryptedPassword = encrypt(password)
        const count = await User.count({})
        const user = new User({name, email, password: encryptedPassword, admin: !count, activationToken})

        await user.save()

        let auth = null
        if (!count) auth = await authenticate(email, password)
        else sendMail({
                email,
                subject: 'PodTalks Hesabınızı Aktifleştirin',
                html: `
                    <h1>PodTalks</h1>
                    <p>Merhaba ${name},</p>
                    <p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın.</p>
                    <a href="${process.env.APP_URL}/activate/${activationToken}">${process.env.APP_URL}/activate/${activationToken}</a>
                `,
                text: `
                    PodTalks\n
                    Merhaba ${name},\n
                    Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın.\n
                    ${process.env.APP_URL}/activate/${activationToken}
                `
            }, (err) => {
                if (err) throw err
            })

        res.status(200).json({
            status: 'OK',
            message: 'Kullanıcı oluşturuldu.',
            user: auth ? {...auth} : null,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Kullanıcı oluşturulurken bir hata meydana geldi.',
            error: e?.message || e,
        })
    }
}

export const postActivateUser = async (req, res) => {
    try {
        const {token} = req.params

        if (!token) return res.status(400).json({
            status: 'ERROR',
            message: 'Token gereklidir.',
        })

        jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
            if (err?.message === 'jwt expired') {
                const user = await User.findOne({activationToken: token})

                if (!user) return res.status(404).json({
                    status: 'ERROR',
                    message: 'Kullanıcı bulunamadı.',
                })

                const activationToken = jwt.sign({email: user.email}, process.env.JWT_KEY, {expiresIn: '1h'})

                user.activationToken = activationToken
                await user.save()

                sendMail({
                    email: user.email,
                    subject: 'PodTalks Hesabınızı Aktifleştirin',
                    html: `
                    <h1>PodTalks</h1>
                    <p>Merhaba ${user.name},</p>
                    <p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın.</p>
                    <a href="${process.env.APP_URL}/activate/${activationToken}">${process.env.APP_URL}/activate/${activationToken}</a>
                `,
                    text: `
                    PodTalks\n
                    Merhaba ${user.name},\n
                    Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın.\n
                    ${process.env.APP_URL}/activate/${activationToken}
                `
                }, (err) => {
                    if (err) throw err
                })

                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Token süresi doldu.',
                })
            }

            if (err) return res.status(400).json({
                status: 'ERROR',
                message: 'Token geçersiz.',
            })

            const user = await User.findOne({email: decoded.email})

            if (!user) return res.status(404).json({
                status: 'ERROR',
                message: 'Kullanıcı bulunamadı.',
            })

            user.activationToken = null
            user.activated = true
            await user.save()

            res.status(200).json({
                status: 'OK',
                message: 'Kullanıcı aktifleştirildi.',
            })
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Kullanıcı aktifleştirilirken bir hata meydana geldi.',
            error: e.message,
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

        if (!user.activated && !user.admin) errors.push({
            field: 'email',
            message: 'Bu hesap henüz aktif değil. Lütfen e-posta adresinize gönderilen aktivasyon linkine tıklayarak hesabınızı aktif edin.',
        })

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
            error: e.message,
        })
    }
}

export const postForgotPassword = async (req, res) => {
    try {
        const {email} = req.body
        const errors = []

        if (!email?.trim().length) errors.push({
            field: 'email',
            message: 'Bir e-posta adresi girin.',
        })
        else if (!checkEmail(email)) errors.push({
            field: 'email',
            message: 'Girdiğiniz e-posta adresi geçersiz.',
        })

        if (returnErrors(errors, res)) return

        const user = await User.findOne({email})

        if (!user) errors.push({
            field: 'email',
            message: 'Bu e-posta adresine ait bir kullanıcı bulunamadı.',
        })
        else if (!user.activated && !user.admin) errors.push({
            field: 'email',
            message: 'Bu hesap henüz aktif değil. Lütfen e-posta adresinize gönderilen aktivasyon linkine tıklayarak hesabınızı aktif edin.',
        })

        if (returnErrors(errors, res)) return

        const resetPasswordToken = jwt.sign({email}, process.env.JWT_KEY, {expiresIn: '1h'})
        user.passwordResetToken = resetPasswordToken
        await user.save()

        sendMail({
            email,
            subject: 'PodTalks Şifre Sıfırlama',
            html: `
                <h1>PodTalks</h1>
                <p>Merhaba ${user.name},</p>
                <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın.</p>
                <a href="${process.env.APP_URL}/reset-password/${resetPasswordToken}">${process.env.APP_URL}/reset-password/${resetPasswordToken}</a>
            `,
            text: `
                PodTalks\n
                Merhaba ${user.name},\n
                Şifrenizi sıfırlamak için aşağıdaki linke tıklayın.\n
                ${process.env.APP_URL}/reset-password/${resetPasswordToken}
            `
        }, (err) => {
            if (err) throw err
        })

        res.status(200).json({
            status: 'OK',
            message: 'Şifre sıfırlama maili gönderildi.',
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Şifre sıfırlama maili gönderilirken bir hata meydana geldi.',
            error: e.message,
        })
    }
}

export const postCheckPasswordToken = async (req, res) => {
    try {
        const {token} = req.params

        if (!token) return res.status(400).json({
            status: 'ERROR',
            message: 'Token gereklidir.',
        })

        jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
            if (err) return res.status(400).json({
                status: 'ERROR',
                message: 'Token geçersiz.',
            })

            const user = await User.findOne({email: decoded.email})

            if (!user) return res.status(404).json({
                status: 'ERROR',
                message: 'Kullanıcı bulunamadı.',
            })

            if (user.passwordResetToken !== token) return res.status(400).json({
                status: 'ERROR',
                message: 'Token geçersiz.',
            })

            res.status(200).json({
                status: 'OK',
                message: 'Token geçerli.',
            })
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Şifre sıfırlama tokeni kontrol edilirken bir hata meydana geldi.',
            error: e.message,
        })
    }
}

export const postResetPassword = async (req, res) => {
    try {
        const {token} = req.params
        const errors = []

        if (!token) return res.status(400).json({
            status: 'ERROR',
            message: 'Token gereklidir.',
        })

        jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
            if (err) return res.status(400).json({
                status: 'ERROR',
                message: 'Token geçersiz.',
            })

            const user = await User.findOne({email: decoded.email})

            if (!user) return res.status(404).json({
                status: 'ERROR',
                message: 'Kullanıcı bulunamadı.',
            })

            if (user.passwordResetToken !== token) return res.status(400).json({
                status: 'ERROR',
                message: 'Token geçersiz.',
            })

            const {password, passwordConfirm} = req.body

            if (!password?.trim().length) errors.push({
                field: 'password',
                message: 'Bir şifre girin.',
            })
            else if (!checkPassword(password)) errors.push({
                field: 'password',
                message: 'Yeni şifreniz çok kısa.',
            })

            if (!passwordConfirm?.trim().length) errors.push({
                field: 'passwordConfirm',
                message: 'Şifrenizi onaylayın.',
            })
            else if (password !== passwordConfirm) errors.push({
                field: 'passwordConfirm',
                message: 'Şifreler eşleşmiyor.',
            })

            if (returnErrors(errors, res)) return

            user.password = encrypt(password)
            user.passwordResetToken = null
            await user.save()

            res.status(200).json({
                status: 'OK',
                message: 'Şifre sıfırlandı.',
            })
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Şifre sıfırlanırken bir hata meydana geldi.',
            error: e.message,
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

export const postStartStream = async (req, res) => {
    try {
        const {id} = req.params
        const {title, subject} = req.body

        if (!id) return res.status(400).json({
            status: 'ERROR',
            message: 'ID verisi gereklidir.',
        })

        const user = await User.findById(id)

        if (!user) return res.status(404).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        if (user.stream) return res.status(400).json({
            status: 'ERROR',
            message: 'Kullanıcı zaten yayın yapıyor.',
        })

        user.stream = {
            title: typeof title === 'string' && title?.trim()?.length ? title : `${user.name}'in podcast yayını`,
            subject: typeof subject === 'string' && subject?.trim()?.length ? subject : 'sohbet',
        }
        await user.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Podcast yayını başlatıldı.',
            stream: user.stream,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcast yayını başlatılırken bir hata meydana geldi.',
            error: e.message,
        })
    }
}

export const postUpdateStream = async (req, res) => {
    try {
        const {id} = req.params
        const {title, subject} = req.body

        if (!id) return res.status(400).json({
            status: 'ERROR',
            message: 'ID verisi gereklidir.',
        })

        const user = await User.findById(id)

        if (!user) return res.status(404).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        if (!user.stream) return res.status(400).json({
            status: 'ERROR',
            message: 'Kullanıcının aktif bir yayını yok.',
        })

        user.stream = {
            title: typeof title === 'string' && title?.trim()?.length ? title : `${user.name}'in podcast yayını`,
            subject: typeof subject === 'string' && subject?.trim()?.length ? subject : 'sohbet',
        }
        await user.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Podcast yayını güncellendi.',
            stream: user.stream,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcast yayını güncellenirken bir hata meydana geldi.',
            error: e.message,
        })
    }
}

export const postCloseStream = async (req, res) => {
    try {
        const {id} = req.params

        if (!id) return res.status(400).json({
            status: 'ERROR',
            message: 'ID verisi gereklidir.',
        })

        const user = await User.findById(id)

        if (!user) return res.status(404).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        if (!user.stream) return res.status(400).json({
            status: 'ERROR',
            message: 'Kullanıcı zaten yayında değil.',
        })

        user.stream = null
        await user.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Podcast yayını kapatıldı.',
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcast yayını kapatılırken bir hata meydana geldi.',
            error: e.message,
        })
    }
}