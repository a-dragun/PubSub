const cron = require('node-cron');
const User = require('../models/User');

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  try {
    await User.updateMany(
      { isBanned: true, banDuration: { $lte: now } },
      { isBanned: false, banReason: '', banDuration: null }
    );
    await User.updateMany(
      { isMuted: true, muteDuration: { $lte: now } },
      { isMuted: false, muteReason: '', muteDuration: null }
    );

    console.log(`[UNBAN SCHEDULER]: Successfully processed at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[UNBAN SCHEDULER ERROR]:', err.message);
  }
});
