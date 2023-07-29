import multer from 'multer'
import {join} from 'path'
import checkDir from '../utils/check-dir.js'
import {__dirname} from '../utils/dirname.js'
import 'dotenv/config'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = join(__dirname, '..', 'images')
        checkDir(dir)
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + file.originalname.slice(file.originalname.lastIndexOf('.')))
    }
})

export default multer({storage, limits: {fileSize: process.env.PP_MAXSIZE}})