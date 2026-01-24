const ConversationParticipant = require("./models/ConversationParticipant");
const Message = require("./models/Message");
const mongoose = require("mongoose");
const { encrypt } = require("./helpers/crypto");

function setupMessagingSocket(io) {
  const messagingNamespace = io.of("/messaging");
  messagingNamespace.on("connection", async (socket) => {
    
    
    const user = socket.user;
    if (!user) {
      console.error("Socket konekcija bez korisnika (unauthenticated).");
      return;
    }

    
    const userId = new mongoose.Types.ObjectId(user._id || user.id);

    
    socket.join(`user:${userId.toString()}`);

    
    socket.on("joinConversation", ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });

    
    socket.on("leaveConversation", ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    
    socket.on("message:send", async ({ conversationId, body }) => {
      try {
        if (!body || body.trim() === "" || !conversationId) return;

        const convObjectId = new mongoose.Types.ObjectId(conversationId);

        
        
        const participant = await ConversationParticipant.findOne({ 
          conversationId: convObjectId, 
          userId: userId 
        });
        
        if (!participant) {
          console.error("GREŠKA: Korisnik nije sudionik!");
          return;
        }

        
        const message = new Message({
          conversationId: convObjectId,
          senderId: userId,
          body: encrypt(body.trim()),
          type: "text"
        });
        await message.save();

        
        
        const sender = await mongoose.model("User").findById(userId, "name profilePicture");
        messagingNamespace.to(`conversation:${conversationId}`).emit("private:chat:message", {
          id: message._id,
          conversationId: conversationId,
          senderId: userId.toString(),
          senderName: sender.name,           
          senderAvatar: sender.profilePicture, 
          body: body.trim(),
          type: message.type,
          createdAt: message.createdAt
        });

        
        
        const others = await ConversationParticipant.find({ 
          conversationId: convObjectId, 
          userId: { $ne: userId } 
        });

        others.forEach(p => {
          
          messagingNamespace.to(`user:${p.userId.toString()}`).emit("conversation:unread:update", {
            conversationId: conversationId,
            hasUnread: true
          });
        });

      } catch (err) {
        console.error("Kritična greška u message:send:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Korisnik ${userId} se odspojio sa chat socketa.`);
    });
  });
}

module.exports = { setupMessagingSocket };