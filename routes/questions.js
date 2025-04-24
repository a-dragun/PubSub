const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

router.get("/create", questionController.getCreateQuestion);
router.post("/create", questionController.postCreateQuestion);

module.exports = router;
