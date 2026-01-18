const express = require("express");
const router = express.Router();
const controller = require("../controllers/teamJoinRequestController");

router.post("/:teamId", controller.sendJoinRequest);
router.put("/:id/accept", controller.acceptJoinRequest);
router.put("/:id/reject", controller.rejectJoinRequest);

module.exports = router;
