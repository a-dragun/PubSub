const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRoomsPage);
router.get("/:id", roomController.getRoomPage);
router.get("/:id/password", roomController.getPasswordForm);

router.post("/:id/verify", roomController.verifyPasswordAndAuthorize);

module.exports = router;
