function streakBonus(streak) {
    return 5 * (streak >= 1) +
           20 * (streak >= 1 && streak % 7 === 0) +
           100 * (streak % 50 == 0) +
           1000 * (streak % 365 == 0) * streak/365;
}

function getDaysToNextBonus(currentStreak) {
  for (let n = 1; n <= 365; n++) {
    const next = currentStreak + n;
    if (
      next % 7 === 0 ||
      next % 50 == 0 ||
      next % 365 == 0
    ) {
      return n;
    }
  }
  return null;
}

module.exports = { streakBonus, getDaysToNextBonus };