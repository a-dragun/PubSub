const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/new", authMiddleware.requireAuth, questionController.getCreateQuestion);
router.post("/", authMiddleware.requireAuth, questionController.postCreateQuestion);

module.exports = router;
