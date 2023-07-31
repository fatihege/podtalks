import Article from '../models/article.js'
import User from '../models/user.js'
import {existsSync, unlinkSync} from 'fs'
import {join} from 'path'
import {__dirname} from '../utils/dirname.js'

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

export const getArticles = async (req, res) => {
    try {
        const {sort, order, limit} = req.query
        const projection = {title: 1, image: 1, content: {$substrCP: ['$content', 0, 50]}}
        const articles = sort && order ? await Article.find({}, projection).sort({[sort]: order}).populate({
            path: 'creator',
            select: 'image name'
        }).limit(Number(limit) || 50) : await Article.find({}, projection).populate({
            path: 'creator',
            select: 'image name'
        }).limit(Number(limit) || 50)

        return res.status(200).json({
            status: 'OK',
            message: 'Makaleler bulundu.',
            articles,
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Makaleler aranırken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const getArticle = async (req, res) => {
    try {
        const {id} = req.params
        const article = await Article.findById(id).populate({
            path: 'creator',
            select: 'image name'
        })

        if (!article) return res.status(400).json({
            status: 'ERROR',
            message: 'Makale bulunamadı.',
        })

        article.hits++
        await article.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Makale bulundu.',
            article,
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Makale aranırken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const deleteArticle = async (req, res) => {
    try {
        const {id} = req.params
        const article = await Article.findById(id)

        if (!article) return res.status(400).json({
            status: 'ERROR',
            message: 'Makale bulunamadı.',
        })

        if (article.image) {
            const imagePath = join(__dirname, '..', 'images', article.image)
            if (existsSync(imagePath)) unlinkSync(imagePath)
        }

        await Article.deleteOne({_id: id})

        return res.status(200).json({
            status: 'OK',
            message: 'Makale silindi.',
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Makale silinirken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const postCreateArticle = async (req, res) => {
    try {
        const {user: creator} = req.query
        const image = req.file
        const {title, content} = req.body
        const errors = []

        if (!title) errors.push('Başlık boş bırakılamaz.')
        else if (title?.trim()?.length < 10) errors.push('Girdiğiniz başlık çok kısa.')

        if (!content) errors.push('İçerik boş bırakılamaz.')
        else if (content?.trim()?.length < 100) errors.push('En az 100 karakterli bir içerik girmelisiniz.')

        if (returnErrors(errors, res)) return

        const user = await User.findById(creator)
        if (!user) return res.status(400).json({
            status: 'ERROR',
            message: 'Kullanıcı bulunamadı.',
        })

        const article = await Article.create({
            image: image?.filename,
            title: title?.trim(),
            content: content?.trim(),
            creator,
        })

        return res.status(200).json({
            status: 'OK',
            message: 'Makale oluşturuldu.',
            id: article.id.toString(),
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Makale oluşturulurken bir hata oluştu.',
            error: e.message,
        })
    }
}