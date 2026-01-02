const User = require("../models/User");

exports.getHome = async (req, res) => {
  try {
    let user = null;
    let streakData = null;

    if (req.session && req.session.user) {
      const dbUser = await User.findById(req.session.user.id);

      if (dbUser) {
        user = {
          id: dbUser._id,
          name: dbUser.name,
          adminLevel: dbUser.adminLevel,
          profilePicture: dbUser.profilePicture
        };

        if (req.session.user.showStreakModal) {
          const today = new Date();
          const activeDates = [];
          for (let i = 0; i < dbUser.activityStreak; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            activeDates.push(d.toISOString().slice(0, 10));
          }

          streakData = {
            today: today,
            streakLength: dbUser.activityStreak,
            activeDates: activeDates,
            todayBonus: req.session.user.todayBonus,
            daysToNextBonus: req.session.user.daysToNextBonus
          };

          req.session.user.showStreakModal = false;
        }
      }
    }

    return res.render("home", { user, streakData});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};
