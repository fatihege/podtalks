import Article from '../models/article.js'

export const getArticles = async (req, res) => {
    try {
        const {sort, order, limit} = req.query
        const projection = {content: { $substrCP: ['$content', 0, 50] }}
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