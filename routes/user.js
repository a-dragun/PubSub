const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.delete("/", userController.deleteUser);

router.get("/profile", userController.getProfile);
router.get("/edit", userController.getEditUserPage);
router.get("/list", userController.getUserList);
router.get("/:id", userController.getUserPage);

router.put("/edit", userController.editUser);

module.exports = router;