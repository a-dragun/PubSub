const express = require("express");
const router = express.Router();
const generalController = require("../controllers/generalController");

router.get("/", generalController.getHome);

module.exports = router;