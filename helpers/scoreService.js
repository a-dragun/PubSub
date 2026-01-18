const Team = require('../models/Team');

async function addPoints(userId, points) {
  const team = await Team.findOne({ 'members.userId': userId });
  if (!team) return;

  team.totalPoints = (team.totalPoints || 0) + points;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPoints = team.monthlyPoints.get(currentMonth) || 0;
  team.monthlyPoints.set(currentMonth, currentMonthPoints + points);

  await team.save();
}

module.exports = {
  addPoints
};
