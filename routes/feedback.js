const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.get('/feedback', (req, res) => {
    res.render('feedback/index', {
        title: 'Podrška i Povratne Informacije',
        success: req.query.success
    });
});

router.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;

        const feedback = new Feedback({
            userId: req.session.user.id,
            type,
            message
        });

        await feedback.save();
        res.redirect('/support/feedback?success=true');
    } catch (err) {
        console.error('Error saving feedback:', err);
        res.status(500).render('feedback/index', {
            title: 'Podrška i Povratne Informacije',
            error: 'Došlo je do greške prilikom spremanja povratnih informacija.',
            success: false
        });
    }
});

module.exports = router;
