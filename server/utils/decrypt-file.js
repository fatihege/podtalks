import {createReadStream, createWriteStream, WriteStream} from 'fs'
import crypto from 'crypto'

export default (inputPath, outputPath) => new Promise((resolve, reject) => {
    if (outputPath instanceof WriteStream) {
        const input = createReadStream(inputPath)
        const output = createWriteStream(outputPath)
        const decipher = crypto.createDecipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV)

        input.on('data', data => {
            const decryptedData = decipher.update(data, 'hex', 'utf8')
            output.write(decryptedData)
        })

        input.on('end', () => {
            const decryptedData = decipher.final('utf8')
            output.write(decryptedData)
            output.end()
            resolve()
        })

        input.on('error', err => {
            reject(err)
        })
    } else {
        const input = createReadStream(inputPath)
        const res = outputPath
        const decipher = crypto.createDecipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV)
        res.header({'Content-Type': 'audio/mp4'})

        input.on('data', data => {
            const decryptedData = decipher.update(data, 'hex')
            res.write(decryptedData)
        })

        input.on('end', () => {
            const decryptedData = decipher.final()
            res.write(decryptedData)
            res.end()
            resolve()
        })

        input.on('error', err => {
            res.end()
            reject(err)
        })
    }
})