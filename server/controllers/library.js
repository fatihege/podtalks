import Article from '../models/article.js'
import User from '../models/user.js'
import {existsSync, unlinkSync} from 'fs'
import {join} from 'path'
import {__dirname} from '../utils/dirname.js'
import Book from '../models/book.js'

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

export const getBooks = async (req, res) => {
    try {
        const {sort, order, limit} = req.query
        const projection = {title: 1, image: 1, author: 1, content: {$substrCP: ['$content', 0, 50]}}
        const books = sort && order ?
            await Book.find({}, projection).sort({[sort]: order}).limit(Number(limit) || 50) :
            await Book.find({}, projection).limit(Number(limit) || 50)

        return res.status(200).json({
            status: 'OK',
            message: 'Kitaplar bulundu.',
            books,
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Kitaplar aranırken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const getBook = async (req, res) => {
    try {
        const {id} = req.params
        const book = await Book.findById(id)

        if (!book) return res.status(400).json({
            status: 'ERROR',
            message: 'Kitap bulunamadı.',
        })

        book.hits++
        await book.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Kitap bulundu.',
            book,
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Kitap aranırken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const deleteBook = async (req, res) => {
    try {
        const {id} = req.params
        const book = await Book.findById(id)

        if (!book) return res.status(400).json({
            status: 'ERROR',
            message: 'Kitap bulunamadı.',
        })

        if (book.image) {
            const imagePath = join(__dirname, '..', 'public', 'uploads', book.image)
            if (existsSync(imagePath)) unlinkSync(imagePath)
        }

        if (book.audio) {
            const audioPath = join(__dirname, '..', 'public', 'uploads', book.audio)
            if (existsSync(audioPath)) unlinkSync(audioPath)
        }

        await Book.deleteOne({_id: id})

        return res.status(200).json({
            status: 'OK',
            message: 'Kitap silindi.',
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Kitap silinirken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const postCreateBook = async (req, res) => {
    try {
        const {user: creator} = req.query
        const image = req.files?.image ? req.files?.image[0]?.filename : null
        const audio = req.files?.audio ? req.files?.audio[0]?.filename : null
        const {title, content, author} = req.body
        const errors = []

        if (!title) errors.push({
            field: 'title',
            message: 'Başlık boş bırakılamaz.',
        })

        if (!content) errors.push({
            field: 'content',
            message: 'İçerik boş bırakılamaz.',
        })
        else if (content?.trim()?.length < 100) errors.push({
            field: 'content',
            message: 'En az 100 karakterli bir içerik girmelisiniz.',
        })

        if (!author) errors.push({
            field: 'author',
            message: 'Yazar boş bırakılamaz.',
        })

        if (returnErrors(errors, res)) return

        const user = await User.findById(creator)
        if (!user) return res.status(400).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        if (!user.admin) return res.status(403).json({
            status: 'ERROR',
            message: 'Bu işlem için yetkiniz yok.',
        })

        const book = await Book.create({
            image,
            title: title?.trim(),
            content: content?.trim(),
            author: author?.trim(),
            audio,
        })

        return res.status(200).json({
            status: 'OK',
            message: 'Kitap oluşturuldu.',
            id: book.id.toString(),
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Kitap oluşturulurken bir hata oluştu.',
            error: e.message,
        })
    }
}