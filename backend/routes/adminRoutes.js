const express = require("express");
const router = express.Router();

// IMPORT ADMIN CONTROLLER
const {
    getAdminStats
} = require("../controllers/adminController");

// IMPORT MIDDLEWARE
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ADMIN DASHBOARD STATS
router.get(
    "/stats",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminStats
);

module.exports = router;