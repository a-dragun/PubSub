const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/new", questionController.getCreateQuestion);
router.post("/", questionController.postCreateQuestion);

module.exports = router;
