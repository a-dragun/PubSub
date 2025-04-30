const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", adminController.getAdminDashboard);
router.get("/users", adminController.getUsers);
router.get("/questions", adminController.getQuestions);
router.get("/users/:id", adminController.getUser);
router.get("/questions/:id", adminController.getQuestion);

router.put("/users", adminController.putUsers);
router.put("/questions", adminController.putQuestions);
router.put("/users/:id", authMiddleware.checkAdminLevel(2), adminController.putUser);
router.put("/questions/:id", adminController.putQuestion);

router.delete("/users/:id", authMiddleware.checkAdminLevel(2), adminController.deleteUser);
router.delete("/questions/:id", authMiddleware.checkAdminLevel(2), adminController.deleteQuestion);

module.exports = router;