const Report = require('../models/Report');
const User = require('../models/User');

exports.createReport = async (req, res) => {
  try {
    const { reportedUsername, reportedMessage, reason } = req.body;
    const authorId = req.session.user.id;

    if (!reportedUsername || !reportedMessage || !reason) {
      return res.status(400).json({ message: 'Nedostaju podaci za prijavu.' });
    }

    const reportedUser = await User.findOne({ name: reportedUsername }, '_id');

    if (!reportedUser) {
      return res.status(404).json({ message: 'Korisnik za prijavu nije pronađen.' });
    }

    const reportedUserId = reportedUser._id;

    if (authorId.toString() === reportedUserId.toString()) {
      return res.status(400).json({ message: 'Ne možeš prijaviti samog sebe.' });
    }

    const report = await Report.create({
      authorId,
      reportedUserId,
      reportedMessage,
      reason
    });

    res.status(201).json({ success: true, report });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
};
