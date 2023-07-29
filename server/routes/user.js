import express from 'express'
import {
    getUser,
    postRegisterUser,
    postActivateUser,
    postLoginUser,
    postForgotPassword,
    postCheckPasswordToken,
    postResetPassword,
    postUpdateProfile,
    postUpdateUser,
    postStartStream,
    postCloseStream, postUpdateStream
} from '../controllers/user.js'
import {profilePhotoUpload} from '../lib/multer.js'

const router = express.Router()

router.get('/', getUser)
router.get('/:token', getUser)
router.post('/signup', postRegisterUser)
router.post('/activate/:token', postActivateUser)
router.post('/login', postLoginUser)
router.post('/forgot-password', postForgotPassword)
router.post('/check-password-token/:token', postCheckPasswordToken)
router.post('/reset-password/:token', postResetPassword)
router.post('/update-profile/:id', profilePhotoUpload.single('image'), postUpdateProfile)
router.post('/update/:id', postUpdateUser)
router.post('/start-stream/:id', postStartStream)
router.post('/update-stream/:id', postUpdateStream)
router.post('/close-stream/:id', postCloseStream)

export default router