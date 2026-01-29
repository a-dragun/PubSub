const User = require("../models/User");
const Friendship = require("../models/Friendship");
const socketHandler = require("../socket");
const userSocketMap = socketHandler.userSocketMap;
const levels = require("../config/levels");

exports.deleteUser = async (req, res) => {
  try {
    const user = req.session.user;
    if (user && user.id) {
      if (userSocketMap) {
        const userSocket = userSocketMap.get(user.name);
        if (userSocket && userSocket.socket) {
          userSocket.socket.emit('forceDisconnect', { reason: "Obrisan račun" });
        }
      }
      await User.findByIdAndDelete(user.id);
      req.session.destroy(() => res.redirect("/"));
    }
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
}

exports.getUserList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';
    const sort = req.query.sort || 'name-asc';

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = {};
    switch (sort) {
      case 'name-asc':
        sortOption.name = 1;
        break;
      case 'totalScore-desc':
        sortOption.totalScore = -1;
        break;
      case 'name-desc':
        sortOption.name = -1;
        break;
      case 'totalScore-asc':
        sortOption.totalScore = 1;
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

    return res.render("user/list", {
      users,
      currentPage: page,
      totalPages,
      limit,
      search,
      sort,
    });
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    let userId = req.session.user.id;
    let dbUser = await User.findById(userId).lean();
    const { password, ...user } = dbUser;
    const levelData = levels.levels.find(l => l.level === user.currentLevel) || levels[0];
    return res.render("user/profile", { user, levelData });

  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
}

exports.editUser = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { username, newPassword, repeatPassword, profilePicture } = req.body;

    if (newPassword || repeatPassword) {
      if (newPassword !== repeatPassword) {
        return res.status(400).render('error', { status: 400, message: "Lozinke se ne podudaraju!" });
      }
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).render('error', { status: 400, message: "Lozinka mora imati barem 8 znakova!" });
      }
    }

    if (username && (username.length > 15 || username.includes(' '))) {
              return res.status(400).render('error', { status: 400, message: "Korisničko ime mora imati barem 15 znakova i mora biti jedna riječ!" });
    }


    const user = await User.findById(userId);

    if (userSocketMap) {
      const userSocket = userSocketMap.get(user.name);
      if (userSocket && userSocket.socket) {
        userSocket.socket.emit('forceDisconnect', { reason: "Uređen račun" });
      }
    }
    if (username) {
      user.name = username;
    }

    if (profilePicture) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const isValid = allowedExtensions.some(ext => profilePicture.toLowerCase().endsWith(ext));
      if (!isValid) {
        return res.send("Profile picture must be an image (jpg, png, gif, webp).");
      }
      user.profilePicture = profilePicture;
    }

    if (newPassword) {
      user.password = newPassword;
    }
    await user.save();
    req.session.user.name = user.name;
    req.session.user.profilePicture = user.profilePicture;
    res.locals.currentUser.profilePicture = user.profilePicture;
    res.locals.currentUser.name = user.name;


    return res.redirect("/user/profile/");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};


exports.getEditUserPage = async (req, res) => {
  try {
    let userId = req.session.user.id;
    let user = await User.findById(userId).lean();
    return res.render("user/editUser", { user });

  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
}
exports.getUserPage = async (req, res) => {
  try {
    let userId = req.params.id;
    let currentUser = req.session.user;

    let user = await User.findById(userId).lean();
    if (!user) return res.status(404).render('error', { status: 404, message: "Korisnik nije pronađen!" });

    let friendshipStatus;
    let canSendFriendRequest = false;

    if (user._id.toString() !== currentUser.id) {
      const existingFriendship = await Friendship.findOne({
        $or: [
          { requester: currentUser.id, receiver: userId },
          { requester: userId, receiver: currentUser.id }
        ]
      });

      if (!existingFriendship) {
        canSendFriendRequest = true;
      } else {
        friendshipStatus = existingFriendship.status;
      }
    }
    const levelData = levels.levels.find(l => l.level === user.currentLevel) || levels[0];
    return res.render("user/getUserPage", { user, currentUser, canSendFriendRequest, friendshipStatus, levelData });

  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.requestEditorAccess = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);

    user.editorRequestStatus = 'pending';
    await user.save();

    req.session.user.editorRequestStatus = 'pending';
    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).render('error', { status: 500, message: "Greška na serveru!" });
  }
};