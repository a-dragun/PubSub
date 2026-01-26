
const Conversation = require("../models/Conversation");
const ConversationParticipant = require("../models/ConversationParticipant");
const Friendship = require("../models/Friendship");
const Team = require("../models/Team");
const mongoose = require('mongoose');

async function openDirectConversation(req, res) {
  try {
    const userIdString = req.session.user.id;
    const friendIdString = req.params.friendId;

    
    const userId = new mongoose.Types.ObjectId(userIdString);
    const friendId = new mongoose.Types.ObjectId(friendIdString);

    
    const friendship = await Friendship.findOne({
      status: "accepted",
      $or: [
        { requester: userId, receiver: friendId },
        { requester: friendId, receiver: userId }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: "Niste prijatelji s ovim korisnikom." });
    }

    
    
    const myConversations = await ConversationParticipant.find({ userId }).distinct("conversationId");
    
    
    const sharedParticipant = await ConversationParticipant.findOne({
      conversationId: { $in: myConversations },
      userId: friendId
    });

    let conversationId;

    if (sharedParticipant) {
      
      conversationId = sharedParticipant.conversationId;
    } else {
      
      const newConversation = new Conversation({ type: "direct" });
      await newConversation.save();

      
      const participants = [
        { conversationId: newConversation._id, userId: userId },
        { conversationId: newConversation._id, userId: friendId }
      ];
      await ConversationParticipant.insertMany(participants);
      
      conversationId = newConversation._id;
    }

    res.json({ conversationId: conversationId });

  } catch (err) {
    console.error("DEBUG ERROR:", err); 
    return res.status(500).json({ message: "Greška pri otvaranju direct conversationa." });
  }
}

async function openTeamConversation(req, res) {
  try {
    const userIdString = req.session.user.id;
    const userId = new mongoose.Types.ObjectId(userIdString);

    const teamIdString = req.params.teamId;
    const teamId = new mongoose.Types.ObjectId(teamIdString);

    
    const team = await Team.findOne({ _id: teamId, "members.userId": userId });
    if (!team) {
      return res.status(403).json({ message: "Niste član ovog tima." });
    }

    
    let conversation = await Conversation.findOne({ type: "team", teamId });
    if (!conversation) {
      conversation = new Conversation({ type: "team", teamId });
      await conversation.save();

      
      const participants = team.members.map(m => new ConversationParticipant({
        conversationId: conversation._id,
        userId: m.userId
      }));
      await ConversationParticipant.insertMany(participants);
    }

    res.json({ conversationId: conversation._id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri otvaranju team conversationa." });
  }
}

module.exports = { openDirectConversation, openTeamConversation };
