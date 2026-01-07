const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

router.get("/", friendsController.getFriends);

router.post("/", friendsController.sendFriendRequest);

router.put("/:id/accept", friendsController.acceptFriendRequest);

router.delete("/:id", friendsController.deleteFriend);

module.exports = router;
