const User = require("../models/User");
const Question = require("../models/Question");
const Room = require('../models/Room');
const categories = require('../config/categories');

exports.getAdminDashboard = async (req, res) => {
  try{
      let dbUsers = await User.find().lean();
      let users = dbUsers.map(({ password, ...user }) => user);
      let questions = await Question.find().lean();
      let pendingQuestions = [...(questions.filter(q => q.status == 'pending'))];
      let mutedUsers = [...(users.filter(u => u.isMuted == true))];
      let bannedUsers = [...(users.filter(u => u.isBanned == true))];
      return res.render("admin/admin_dashboard", {mutedUsers, bannedUsers, pendingQuestions});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getUsers = async(req, res) => {
  try {
    let dbUsers = await User.find().lean();
    let users = dbUsers.map(({ password, ...user }) => user);
    return res.render("admin/users/index", {users});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getQuestions = async(req, res) => {
  try {
    let questions = await Question.find().lean();
    let approvedQuestions = [...(questions.filter(q => q.status == 'approved'))];
    let pendingQuestions = [...(questions.filter(q => q.status == 'pending'))];
    return res.render("admin/questions/index", {approvedQuestions, pendingQuestions});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getUser = async(req, res) => {
  try {
    let userId = req.params.id;
    let dbUser = await User.findById(userId).lean();
    const { password, ...filteredUser } = dbUser;
    return res.render("admin/users/user", {filteredUser});
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
    const {name, type, categories, maxUsers} = req.body;

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
      'categories': selectedCategories,
      'maxUsers': maxUsers
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
    await Room.findByIdAndDelete(id);
    return res.redirect("/admin/rooms/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.banUser = async (req, res) => {
  try {
    const {banReason, banDuration} = req.body;
    const id = req.params.id;
    const user = await User.findById(id);
    if(user.adminlevel == 2) {
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
      return res.redirect("/admin/users/");
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
    await User.findByIdAndUpdate(id, {'isMuted': true, 'muteReason': muteReason, 'muteDuration': muteDuration});
    return res.redirect("/admin/users/");
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