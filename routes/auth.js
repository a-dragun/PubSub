const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/register", authMiddleware.blockAuthenticatedUser, authController.getRegister);
router.post("/register", authMiddleware.blockAuthenticatedUser, authController.postRegister);
router.get("/login", authMiddleware.blockAuthenticatedUser, authController.getLogin);
router.post("/login", authMiddleware.blockAuthenticatedUser, authController.postLogin);
router.post("/logout", authMiddleware.requireAuth, authController.logout);

module.exports = router;
