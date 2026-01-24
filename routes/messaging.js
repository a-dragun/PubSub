
const express = require("express");
const router = express.Router();
const messagingController = require("../controllers/messagingController");


router.get("/drawer", messagingController.getDrawer);

module.exports = router;
