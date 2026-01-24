const User = require("../models/User");
const Team = require("../models/Team");
const Friendship = require("../models/Friendship");
const Conversation = require("../models/Conversation");
const ConversationParticipant = require("../models/ConversationParticipant");
const Message = require("../models/Message");
const mongoose = require('mongoose');

async function getDrawer(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userIdString = req.session.user.id;
    const userId = new mongoose.Types.ObjectId(userIdString);

    const friendships = await Friendship.find({
      status: "accepted",
      $or: [{ requester: userId }, { receiver: userId }]
    });

    const friendIds = friendships.map(f => 
      f.requester.toString() === userId.toString() ? f.receiver : f.requester
    );

    const friends = await User.find({ _id: { $in: friendIds } }, "name profilePicture");
    const teamDoc = await Team.findOne({ "members.userId": userId }, "name");

    const friendData = await Promise.all(friends.map(async friend => {

      const myConversations = await ConversationParticipant.find({ userId }).distinct("conversationId");
      const sharedParticipant = await ConversationParticipant.findOne({
        conversationId: { $in: myConversations },
        userId: friend._id
      });

      let conversationId = null;
      let hasUnread = false;

      if (sharedParticipant) {
        conversationId = sharedParticipant.conversationId;
        const conversation = await Conversation.findOne({ _id: conversationId, type: "direct" });
        
        if (conversation) {
          const myEntry = await ConversationParticipant.findOne({ conversationId, userId });
          const lastMessage = await Message.findOne({ conversationId }).sort({ createdAt: -1 });

          if (lastMessage) {
            if (!myEntry.lastReadMessageId || lastMessage._id.toString() > myEntry.lastReadMessageId.toString()) {
              hasUnread = true;
            }
          }
        }
      }

      return {
        id: friend._id, 
        conversationId: conversationId, 
        name: friend.name,
        avatar: friend.profilePicture,
        hasUnread
      };
    }));


    let teamData = null;
    if (teamDoc) {
      const conversation = await Conversation.findOne({ type: "team", teamId: teamDoc._id });
      let hasUnread = false;
      let conversationId = conversation ? conversation._id : null;

      if (conversation) {
        const myEntry = await ConversationParticipant.findOne({ conversationId, userId });
        const lastMessage = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
        if (lastMessage && (!myEntry.lastReadMessageId || lastMessage._id.toString() > myEntry.lastReadMessageId.toString())) {
          hasUnread = true;
        }
      }

      teamData = {
        id: teamDoc._id,
        conversationId: conversationId,
        name: teamDoc.name,
        hasUnread
      };
    }

    res.json({ friends: friendData, team: teamData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri dohvaćanju drawer-a." });
  }
}

module.exports = { getDrawer };
