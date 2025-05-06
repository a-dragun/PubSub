const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", adminController.getAdminDashboard);
router.get("/users", adminController.getUsers);
router.get("/questions", adminController.getQuestions);
router.get("/users/:id", adminController.getUser);
router.get("/questions/:id", adminController.getQuestion);
router.get("/rooms/new", adminController.getCreateRoomPage);
router.get("/rooms", adminController.getRooms);
router.get("/rooms/:id", adminController.getRoom);

router.post("/bulk_update", adminController.bulkUpdate);
router.post("/rooms", adminController.createRoom);
router.post("/users/:id/ban", authMiddleware.checkAdminLevel(1), adminController.banUser);
router.post("/users/:id/unban", authMiddleware.checkAdminLevel(1), adminController.unbanUser);
router.post("/users/:id/mute", authMiddleware.checkAdminLevel(1), adminController.muteUser);
router.post("/users/:id/unmute", authMiddleware.checkAdminLevel(1), adminController.unmuteUser);

router.put("/users/:id", authMiddleware.checkAdminLevel(2), adminController.updateUser);
router.put("/questions/:id", adminController.updateQuestion);

router.delete("/users/:id", authMiddleware.checkAdminLevel(2), adminController.deleteUser);
router.delete("/questions/:id", authMiddleware.checkAdminLevel(2), adminController.deleteQuestion);
router.delete("/rooms/:id", adminController.deleteRoom);

module.exports = router;