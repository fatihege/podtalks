import User from '../models/user.js'

const getPopulars = async limit => {
    return User.aggregate([
        { $match: { activated: true } },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'following',
                as: 'followers',
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                image: 1,
                stream: 1,
                hits: 1,
                followersCount: {$size: '$followers'},
            },
        },
        {$sort: {hits: -1, followersCount: -1}},
    ]).limit(limit)
}

export const getExplore = async (req, res) => {
    try {
        const active = await User.find({activated: true, stream: {$ne: null}}, {
            password: 0,
            email: 0
        }).sort({hits: -1}).limit(30)
        const popular = await getPopulars(100)
        const newbie = await User.find({activated: true}, {password: 0, email: 0}).sort({createdAt: -1}).limit(50)

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