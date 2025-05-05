const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRoomsPage);
router.get("/:id", roomController.getRoomPage);

module.exports = router;
