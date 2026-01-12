const News = require('../models/News');

exports.getNews = async (req, res) => {
    try {
        const newsDetails = await News.find().sort({ createdAt: -1 }).populate('author', 'name');
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
        const { title, content, imageUrl, category } = req.body;

        const newNews = new News({
            title,
            content,
            imageUrl,
            category,
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
        res.render('news/show', {
            title: newsItem.title,
            newsItem,
            currentUser: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
