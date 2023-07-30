import User from '../models/user.js'

export const getExplore = async (req, res) => {
    try {
        const active = await User.find({activated: true, stream: {$ne: null}}, {
            password: 0,
            email: 0
        }).sort({hits: -1}).limit(30)
        const popular = await User.find({activated: true}, {password: 0, email: 0}).sort({hits: -1}).limit(30)
        const newbie = await User.find({activated: true}, {password: 0, email: 0}).sort({createdAt: -1}).limit(30)

        res.status(200).json({
            status: 'OK',
            message: 'Podcaster\'lar bulundu.',
            active,
            popular,
            newbie,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcaster\'lar aranırken bir hata oluştu.',
            error: e.message,
        })
    }
}

export const getSearch = async (req, res) => {
    try {
        const {query} = req.params

        const podcasters = await User.find({
            activated: true,
            $or: [{name: {$regex: query, $options: 'i'}}, {bio: {$regex: query, $options: 'i'}}]
        }, {password: 0, email: 0}).sort({hits: -1, createdAt: -1}).limit(50)

        res.status(200).json({
            status: 'OK',
            message: 'Podcaster\'lar bulundu.',
            podcasters,
        })
    } catch (e) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Podcaster\'lar aranırken bir hata oluştu.',
            error: e.message,
        })
    }
}