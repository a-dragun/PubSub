const cron = require('node-cron');
const User = require('../models/User');
const Report = require('../models/Report');
const Team = require('../models/Team');
const HappyHour = require("../models/HappyHour");

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  try {
    await User.updateMany(
      { isBanned: true, banDuration: { $lte: now } },
      { isBanned: false, banReason: '', banDuration: null }
    );
    await User.updateMany(
      { isMuted: true, muteDuration: { $lte: now } },
      { isMuted: false, muteReason: '', muteDuration: null }
    );
    await User.updateMany(
      { lastLogin: { $lt: yesterday } },
      { activityStreak: 0 }
    );
    await Report.deleteMany({
      status: { $in: ['resolved', 'rejected'] }
    });
    
if (now.getDate() === 18) {
      let prevMonth = now.getMonth(); 
      let prevYear = now.getFullYear();

      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }

      const monthKey = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;

      const teams = await Team.find({});

      teams.sort((a, b) => {
        const aPoints = (a.monthlyPoints && a.monthlyPoints.get(monthKey)) || 0;
        const bPoints = (b.monthlyPoints && b.monthlyPoints.get(monthKey)) || 0;
        return bPoints - aPoints;
      });

      const bonuses = [500, 250, 100];

      for (let i = 0; i < teams.length; i++) {
        const bonus = bonuses[i] || 0;
        if (bonus === 0) continue;

        for (const member of teams[i].members) {
          await User.findByIdAndUpdate(member.userId, { 
            $inc: { totalScore: bonus } 
          });
        }
      }
    }
    console.log(`[SCHEDULER]: Successfully processed at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[SCHEDULER ERROR]:', err.message);
  }
});



cron.schedule('*/2 * * * *', async () => {
  try {
    const now = new Date();
    const activeHH = await HappyHour.findOne({ isActive: true });

    if (activeHH && activeHH.endsAt <= now) {
      activeHH.isActive = false;
      await activeHH.save();
      console.log('[HAPPY HOUR]: Ended.');
    }
  } catch (err) {
    console.error('[HAPPY HOUR CRON ERROR]:', err.message);
  }
});

