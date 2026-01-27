
const ConversationParticipant = require("../models/ConversationParticipant");
const Message = require("../models/Message");
const mongoose = require('mongoose');
const { encrypt, decrypt } = require("../helpers/crypto");

async function getMessages(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdString = req.session.user.id;
    const userId = new mongoose.Types.ObjectId(userIdString);
    const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    
    const participant = await ConversationParticipant.findOne({ conversationId, userId });
    if (!participant) {
      return res.status(403).json({ message: "Niste participant ove conversation." });
    }

    
    const messages = await Message.find({ conversationId })
      .populate("senderId", "name profilePicture") 
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    
    const result = messages.map(msg => {
      
      const sender = msg.senderId || {};
      
      return {
        id: msg._id,
        conversationId: msg.conversationId,
        senderId: sender._id ? sender._id.toString() : msg.senderId,
        senderName: sender.name || "Nepoznati korisnik",
        senderAvatar: sender.profilePicture || "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        body: decrypt(msg.body),
        type: msg.type,
        createdAt: msg.createdAt
      };
    });

    res.json(result);

  } catch (err) {
    console.error("Greška u getMessages:", err);
    return res.status(500).json({ message: "Greška pri dohvaćanju poruka." });
  }
}

async function sendMessage(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdString = req.session.user.id;
    const userId = new mongoose.Types.ObjectId(userIdString);
    const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);
    const { body } = req.body;

    if (!body || body.trim() === "") {
      return res.status(400).json({ message: "Poruka ne može biti prazna." });
    }

    
    const participant = await ConversationParticipant.findOne({ conversationId, userId });
    if (!participant) {
      return res.status(403).json({ message: "Niste participant ove conversation." });
    }

    
    const message = new Message({
      conversationId,
      senderId: userId,
      body: encrypt(body.trim()),
      type: "text"
    });
    await message.save();

    
    const sender = await mongoose.model("User").findById(userId, "name profilePicture");

    
    const messageData = {
      id: message._id,
      conversationId: conversationId.toString(),
      senderId: userId.toString(),
      senderName: sender.name,           
      senderAvatar: sender.profilePicture, 
      body: body.trim(),
      type: message.type,
      createdAt: message.createdAt
    };

    
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:new", messageData);
    }
    return res.status(201).json(messageData);

  } catch (err) {
    console.error("Greška u sendMessage:", err);
    return res.status(500).json({ message: "Greška pri slanju poruke." });
  }
}

async function markAsRead(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
  return res.status(400).json({ message: "Invalid conversationId" });
}

  try {
    if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
    const userIdString = req.session.user.id;
    const userId = new mongoose.Types.ObjectId(userIdString);
    const conversationId = new mongoose.Types.ObjectId(req.params.conversationId);


    
    const participant = await ConversationParticipant.findOne({ conversationId, userId });
    if (!participant) {
      return res.status(403).json({ message: "Niste participant ove conversation." });
    }

    
    const lastMessage = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
    if (lastMessage) {
      participant.lastReadMessageId = lastMessage._id;
      await participant.save();

      
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${userId}`).emit("conversation:unread:update", {
          conversationId,
          hasUnread: false
        });
      }
    }

    res.json({ message: "Conversation označen kao pročitano." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri markiranju poruka kao pročitanih." });
  }
}

module.exports = { getMessages, sendMessage, markAsRead };
