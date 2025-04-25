const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/dashboard", adminController.getAdminDashboard);
router.post("/delete-user", adminController.postDeleteUser);
router.post("/change-admin-level", adminController.postChangeAdminLevel);
router.post("/handle-question", adminController.postHandleQuestion);

module.exports = router;