import {createReadStream, createWriteStream, WriteStream} from 'fs'
import crypto from 'crypto'

export default async (inputPath, outputPath, range = null) => new Promise((resolve, reject) => {
    if (outputPath instanceof WriteStream) {
        const input = createReadStream(inputPath, range ? {start: range[0], end: range[1]} : {})
        const output = createWriteStream(outputPath)
        const cipher = crypto.createCipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV)

        input.on('data', data => {
            const encryptedData = cipher.update(data, 'utf8', 'hex')
            output.write(encryptedData)
        })

        input.on('end', () => {
            const encryptedData = cipher.final('hex')
            output.write(encryptedData)
            output.end()
            resolve()
        })

        input.on('error', err => {
            reject(err)
        })
    } else {
        const input = createReadStream(inputPath, range ? {start: range[0], end: range[1]} : {})
        const res = outputPath
        const cipher = crypto.createCipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV)
        res.header({'Content-Type': 'audio/mp4'})

        input.on('data', data => {
            const encryptedData = cipher.update(data, 'utf8', 'hex')
            res.write(encryptedData)
        })

        input.on('end', () => {
            const encryptedData = cipher.final('hex')
            res.write(encryptedData)
            res.end()
            resolve()
        })

        input.on('error', err => {
            res.end()
            reject(err)
        })
    }
})