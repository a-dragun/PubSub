const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.delete("/", userController.deleteUser);
router.get("/profile", userController.getProfile);
router.get("/edit", userController.getEditUserPage);
router.put("/edit", userController.editUser);

router.get("/:id", userController.getUserPage);

module.exports = router;