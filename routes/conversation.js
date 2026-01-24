
const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const messageController = require("../controllers/messageController");


router.post("/direct/:friendId", conversationController.openDirectConversation);


router.post("/team/:teamId", conversationController.openTeamConversation);

router.get("/:conversationId/messages", messageController.getMessages);
router.post("/:conversationId/messages", messageController.sendMessage);
router.post("/:conversationId/read", messageController.markAsRead);

module.exports = router;
