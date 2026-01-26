const Friendship = require("../models/Friendship");
const mongoose = require("mongoose");

exports.getFriends = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const currentUser = req.session.user;
    const status = req.query.status || "accepted";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const pendingCount = await Friendship.countDocuments({
      status: "pending",
      receiver: userId
    });

    let query = { status, $or: [{ requester: userId }, { receiver: userId }] };
    const totalFriendships = await Friendship.countDocuments(query);
    const friendshipsRaw = await Friendship.find(query)
      .populate("requester", "name profilePicture totalScore")
      .populate("receiver", "name profilePicture totalScore")
      .skip(skip)
      .limit(limit)
      .lean();
    const friendships = friendshipsRaw.map(f => {
      const friend = f.requester._id.toString() === userId ? f.receiver : f.requester;
      return { ...f, friend, friendName: friend.name };
    });

    const totalPages = Math.ceil(totalFriendships / limit);

    res.render("friends/index", {
      title: status === "pending" ? "Zahtjevi za prijateljstvo" : "Prijatelji",
      friendships,
      status,
      currentUser,
      currentPage: page,
      totalPages,
      pendingCount,
      totalFriendships
    });
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const requesterId = req.session.user.id;
    const { receiverId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(404).render('error', { status: 404, message: "Neispravan ID korisnika." });
    }

    if (requesterId === receiverId) {
      return res.status(403).render('error', { status: 403, message: "Ne možete poslati zahtjev samom sebi." });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, receiver: receiverId },
        { requester: receiverId, receiver: requesterId }
      ]
    });

    if (existing) {
      return res.status(403).render('error', { status: 403, message: "Zahtjev ili prijateljstvo već postoji." });
    }

    await Friendship.create({
      requester: requesterId,
      receiver: receiverId
    });

    res.redirect(`/user/${receiverId}`);
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { id } = req.params;

    const friendship = await Friendship.findOne({
      _id: id,
      receiver: userId,
      status: "pending"
    });

    if (!friendship) {
      return res.redirect("/friends?status=pending");
    }

    friendship.status = "accepted";
    await friendship.save();

    res.redirect("/friends");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

exports.deleteFriend = async (req, res) => {
  try {
    const currentUserId = req.session.user.id;
    const friendId = req.params.id;
    const friendship = await Friendship.findOne({
      $or: [
        { requester: currentUserId, receiver: friendId },
        { requester: friendId, receiver: currentUserId }
      ]
    });

    if (!friendship) return res.status(404).render('error', { status: 404, message: "Prijateljstvo nije pronađeno." });

    await Friendship.deleteOne({ _id: friendship._id });

    return res.redirect(`/user/${friendId}`);
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};

