const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/new", authMiddleware.requireAuth, questionController.getCreateQuestionPage);
router.post("/", authMiddleware.requireAuth, questionController.createQuestion);

module.exports = router;
