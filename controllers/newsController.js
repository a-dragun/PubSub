const News = require('../models/News');
const Comment = require('../models/Comment');

exports.getNews = async (req, res) => {
    try {
        const newsDetails = await News.find()
            .sort({ isHighlighted: -1, createdAt: -1 })
            .populate('author', 'name');
        res.render('news/index', {
            title: 'PubSub - Vijesti',
            news: newsDetails,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getCreateNews = (req, res) => {
    res.render('news/create', {
        title: 'Objavi vijest',
        currentUser: req.session.user
    });
};

exports.postCreateNews = async (req, res) => {
    try {
        const { title, content, imageUrl, category, isHighlighted } = req.body;

        const newNews = new News({
            title,
            content,
            imageUrl,
            category,
            isHighlighted: (req.session.user.adminLevel >= 1) ? (isHighlighted === 'on') : false,
            author: req.session.user.id
        });

        await newNews.save();
        res.redirect('/news');
    } catch (err) {
        console.error(err);
        res.render('news/create', {
            title: 'Objavi vijest',
            error: 'Došlo je do greške prilikom objave vijesti.',
            currentUser: req.session.user
        });
    }
};

exports.getNewsDetail = async (req, res) => {
    try {
        const newsItem = await News.findById(req.params.id).populate('author', 'name');
        if (!newsItem) {
            return res.status(404).send('News not found');
        }

        const comments = await Comment.find({ newsItem: req.params.id })
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePicture');

        res.render('news/show', {
            title: newsItem.title,
            newsItem,
            comments,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.postComment = async (req, res) => {
    try {
        const { content } = req.body;
        const newsId = req.params.id;

        const newComment = new Comment({
            content,
            newsItem: newsId,
            author: req.session.user.id
        });

        await newComment.save();
        res.redirect(`/news/${newsId}`);
    } catch (err) {
        console.error(err);
        res.redirect(`/news/${req.params.id}`);
    }
};

exports.postToggleHighlight = async (req, res) => {
    try {
        const newsItem = await News.findById(req.params.id);
        if (newsItem) {
            newsItem.isHighlighted = !newsItem.isHighlighted;
            await newsItem.save();
        }
        res.redirect('/news');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
