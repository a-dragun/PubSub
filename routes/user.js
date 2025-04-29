const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.delete("/", authMiddleware.requireAuth, userController.deleteUser);
router.get("/profile", authMiddleware.requireAuth, userController.getProfile);
router.put("/", authMiddleware.requireAuth, userController.putUser);

module.exports = router;