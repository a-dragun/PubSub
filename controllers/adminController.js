const User = require("../models/User");
const Question = require("../models/Question");
const Room = require('../models/Room');
const Report = require("../models/Report");
const categories = require('../config/categories');
const socketHandler = require("../socket");
const userSocketMap = socketHandler.userSocketMap;

exports.getAdminDashboard = async (req, res) => {
  try {
    const mutedPage = parseInt(req.query.mutedPage) || 1;
    const bannedPage = parseInt(req.query.bannedPage) || 1;
    const pendingPage = parseInt(req.query.pendingPage) || 1;
    const itemsPerPage = 10;
    let dbUsers = await User.find().lean();
    let users = dbUsers.map(({ password, ...user }) => user);

    let questions = await Question.find().lean();

    let mutedUsers = users.filter(u => u.isMuted === true);
    let bannedUsers = users.filter(u => u.isBanned === true);
    let pendingQuestions = questions.filter(q => q.status === 'pending');

    const totalMutedPages = Math.ceil(mutedUsers.length / itemsPerPage);
    const totalBannedPages = Math.ceil(bannedUsers.length / itemsPerPage);
    const totalPendingPages = Math.ceil(pendingQuestions.length / itemsPerPage);

    return res.render("admin/admin_dashboard", {
      mutedUsers,
      bannedUsers,
      pendingQuestions,
      mutedPage,
      bannedPage,
      pendingPage,
      totalMutedPages,
      totalBannedPages,
      totalPendingPages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error: " + error.message);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';
    const filter = req.query.filter || '';
    const sort = req.query.sort || 'name-asc';

    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (filter === 'banned') {
      query.isBanned = true;
    } else if (filter === 'muted') {
      query.isMuted = true;
    } else if (filter === 'active') {
      query.isBanned = false;
      query.isMuted = false;
    }

    let sortOption = {};
    switch (sort) {
      case 'name-asc':
        sortOption.name = 1;
        break;
      case 'totalScore-desc':
        sortOption.totalScore = -1;
        break;
      case 'questionsApproved-desc':
        sortOption.questionsApproved = -1;
        break;
      case 'adminLevel-desc':
        sortOption.adminLevel = -1;
        break;
      default:
        sortOption.name = 1;
    }

    const totalUsers = await User.countDocuments(query);
    const dbUsers = await User.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();
    const users = dbUsers.map(({ password, ...user }) => user);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.render("admin/users/index", {
      users,
      currentPage: page,
      totalPages,
      limit,
      search,
      filter,
      sort,
    });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questionsPerPage = 20;
    const pendingPage = parseInt(req.query.pendingPage) || 1;
    const approvedPage = parseInt(req.query.approvedPage) || 1;
    const search = req.query.search ? req.query.search.trim() : '';
    const filter = req.query.filter || '';

    let pendingQuery = { status: 'pending' };
    if (search) {
      pendingQuery.text = { $regex: search, $options: 'i' };
    }
    if (filter) {
      pendingQuery.category = filter;
    }

    let approvedQuery = { status: 'approved' };
    if (search) {
      approvedQuery.text = { $regex: search, $options: 'i' };
    }
    if (filter) {
      approvedQuery.category = filter;
    }

    const pendingQuestions = await Question.find(pendingQuery)
      .skip((pendingPage - 1) * questionsPerPage)
      .limit(questionsPerPage)
      .exec();
    const totalPendingQuestions = await Question.countDocuments(pendingQuery);
    const totalPendingPages = Math.ceil(totalPendingQuestions / questionsPerPage);

    const approvedQuestions = await Question.find(approvedQuery)
      .skip((approvedPage - 1) * questionsPerPage)
      .limit(questionsPerPage)
      .exec();
    const totalApprovedQuestions = await Question.countDocuments(approvedQuery);
    const totalApprovedPages = Math.ceil(totalApprovedQuestions / questionsPerPage);

    res.render('admin/questions/index', {
      pendingQuestions,
      approvedQuestions,
      pendingPage,
      approvedPage,
      totalPendingPages,
      totalApprovedPages,
      questionsPerPage,
      search,
      filter,
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


exports.getUser = async(req, res) => {
  try {
    let userId = req.params.id;
    if(userId){
      let dbUser = await User.findById(userId).lean();
      const { password, ...filteredUser } = dbUser;
      return res.render("admin/users/user", {filteredUser});
    }
    else {
      res.send("User id does not exist");
    }
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getQuestion = async(req, res) => {
  try {
    let questionId = req.params.id;
    let question = await Question.findById(questionId);
    let user = await User.findById(question.authorId);
    if(user) {
      username = user.name
    } else {
      username = "deleted user"
    }
    return res.render("admin/questions/question", {question, username});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const currentUser = req.session.user;

    if(id != currentUser.id)
      await User.findByIdAndUpdate(id, updates, { new: true });

    return res.redirect(`/admin/users/${id}`);
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.approveQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await Question.findById(id);
    question.status = "approved";
    const user = await User.findById(question.authorId);
    if(user) {
      user.totalScore += 5;
      user.questionsApproved += 1;
      await user.save();
    }
    await question.save();
    return res.redirect("/admin/questions");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await Question.findByIdAndDelete(id);
    return res.redirect("/admin/questions/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    let user = await User.findById(id);
    if (user.adminLevel == 2) {
      return res.redirect(`/admin/users/${id}`);
    }
    else {
      if(userSocketMap){
      const userSocket = userSocketMap.get(user.name);
      if (userSocket && userSocket.socket) {
        userSocket.socket.emit('forceDisconnect', { reason: "Obrisan račun" });
      }
    }
      await user.deleteOne();
      return res.redirect("/admin/users/");
    }
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.bulkUpdate = async (req, res) => {
  try {
    const { actions } = req.body;

    for (const action of actions.users) {
      const { id, actionType } = action;
      const user = await User.findById(id);

      if (actionType === 'unmute' && user) {
        user.isMuted = false;
        user.muteDuration = null;
        user.muteReason = '';
        await user.save();
      } else if (actionType === 'unban' && user) {
        user.isBanned = false;
        user.banDuration = null;
        user.banReason = '';
        await user.save();
      }
    }
    
    for (const action of actions.questions) {
      const { id, actionType } = action;
      const question = await Question.findById(id);
      const user = await User.findById(question.authorId);

      if (actionType === 'approve' && question) {
        question.status = 'approved';
        if(user){
          user.totalScore+= 5;
          await user.save();
        }
        await question.save();
      } else if (actionType === 'delete' && question) {
        await question.deleteOne();
      }
    }

    return res.json({ success: true });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getCreateRoomPage = (req, res) => {
  try {
    res.render('admin/rooms/create_room', { categories });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.createRoom = async (req, res) => {
  try {
    const {name, type, categories} = req.body;

    if (!name || !type || !categories) {
      return res.status(400).send('All fields are required');
    }

    const selectedCategories = JSON.parse(categories);
    if (selectedCategories.length === 0) {
      return res.status(400).send('You must select at least one category');
    }

    await Room.create({
      'name': name,
      'type': type,
      'categories': selectedCategories
    });
    res.redirect("/admin/dashboard");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getRooms = async(req, res) => {
  try {
    let rooms = await Room.find().lean();
    return res.render("admin/rooms/index", {rooms});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getReports = async (req, res) => {
  try {
    let reports = await Report.find()
        .sort({
          status: 1,
          createdAt: -1
        })
        .lean();
    const userIds = [
      ...new Set(reports.flatMap(r => [r.authorId, r.reportedUserId]))
    ];

    const users = await User.find({ _id: { $in: userIds } }, 'name').lean();
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.name;
    });

    reports = reports.map(r => ({
      ...r,
      authorUsername: userMap[r.authorId] || 'Nepoznato',
      reportedUsername: userMap[r.reportedUserId] || 'Nepoznato'
    }));

    return res.render("admin/reports/index", { reports });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    let report = await Report.findById(reportId).lean();
    if (!report) {
      return res.status(404).send("Report nije pronađen.");
    }

    const userIds = [report.authorId, report.reportedUserId];
    const users = await User.find({ _id: { $in: userIds } }, 'name').lean();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.name;
    });

    report.authorUsername = userMap[report.authorId] || 'Nepoznato';
    report.reportedUsername = userMap[report.reportedUserId] || 'Nepoznato';

    return res.render("admin/reports/report", { report });

  } catch (error) {
    console.error(error);
    return res.status(500).send("Error: " + error.message);
  }
};


exports.getRoom = async(req, res) => {
  try {
    let roomId = req.params.id;
    let room = await Room.findById(roomId).lean();
    return res.render("admin/rooms/room", {room});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteRoom = async (req, res) => {
  try {
    const id = req.params.id;
    if(!socketHandler.isRoomEmpty(id)) {
      res.send("Soba nije prazna i ne može se obrisati!");
    }
    else {
      await Room.findByIdAndDelete(id);
      return res.redirect("/admin/rooms/");
    }
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.banUser = async (req, res) => {
  try {
    const {banReason, banDuration} = req.body;
    const id = req.params.id;
    const user = await User.findById(id);
    if(user.adminLevel == 2) {
      return res.redirect("admin/users")
    }
    else {
      const selectedDate = new Date(banDuration);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        return res.send("Error: Ban duration must be a date after today.");
      }
      await user.updateOne({'isBanned': true, 'banReason': banReason, 'banDuration': banDuration});
      
      if(userSocketMap){
        const userSocket = userSocketMap.get(user.name);
        if (userSocket && userSocket.socket) {
          userSocket.socket.emit('forceDisconnect', { reason: banReason });
        }
      }


      const backUrl = req.get('Referer') || '/admin/users';
      return res.redirect(backUrl);
    }
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.unbanUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, {'isBanned': false, 'banReason': '', 'banDuration': null});
    return res.redirect("/admin/users/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.muteUser = async (req, res) => {
  try {
    const {muteReason, muteDuration} = req.body;
    const id = req.params.id;
    const user = await User.findById(id);

    await user.updateOne({'isMuted': true, 'muteReason': muteReason, 'muteDuration': muteDuration});
    if(userSocketMap){
      const userSocket = userSocketMap.get(user.name);
      if (userSocket && userSocket.socket) {
        userSocket.socket.emit('forceDisconnect', { reason: muteReason });
      }
    }

    const backUrl = req.get('Referer') || '/admin/users';
    return res.redirect(backUrl);
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.unmuteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, {'isMuted': false, 'muteReason': '', 'muteDuration': null});
    return res.redirect("/admin/users/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.dismissReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findByIdAndUpdate(reportId, { status: 'resolved' }, { new: true });
    if (!report) return res.status(404).send("Report nije pronađen.");

    return res.redirect(`/admin/reports/${reportId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Greška pri ažuriranju reporta.");
  }
};

exports.punishUserFromReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).send("Report nije pronađen.");

    const userId = report.reportedUserId;
    req.params.id = userId;

    if (req.body.type === 'ban') {
      req.body.banReason = req.body.reason;
      req.body.banDuration = req.body.duration;
      await exports.banUser(req, res);
    } else if (req.body.type === 'mute') {
      req.body.muteReason = req.body.reason;
      req.body.muteDuration = req.body.duration;
      await exports.muteUser(req, res);
    }
    report.status = 'resolved';
    await report.save();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Greška pri kažnjavanju korisnika.");
  }
};