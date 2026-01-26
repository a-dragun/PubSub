const HappyHour = require('../models/HappyHour');

exports.getHappyHour = async (req, res) => {
  const hh = await HappyHour.findOne({});
  res.json(hh || { isActive: false });
};

exports.activateHappyHour = async (req, res) => {
  const { durationMinutes, multiplier } = req.body;
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMinutes * 60000);

  let hh = await HappyHour.findOne({});
  if (!hh) hh = new HappyHour();

  hh.isActive = true;
  hh.multiplier = multiplier;
  hh.startedAt = now;
  hh.endsAt = endsAt;
  hh.activatedBy = { userId: req.session.user._id, name: req.session.user.name };

  await hh.save();
  const io = req.app.get('io');
  io.emit('happyHourUpdate', { 
    isActive: true, 
    endsAt: hh.endsAt, 
    multiplier: hh.multiplier 
  });

  res.json({ success: true, happyHour: hh });
};

exports.deactivateHappyHour = async (req, res) => {
  const hh = await HappyHour.findOne({});
  if (!hh) return res.json({ success: false });

  hh.isActive = false;
  await hh.save();

  const io = req.app.get('io');
  io.emit('happyHourUpdate', { isActive: false });

  res.json({ success: true });
};