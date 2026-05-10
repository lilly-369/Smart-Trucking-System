const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    updateOrderStatus
} = require("../controllers/orderController");

// 👇 ADD THIS LINE
const authMiddleware = require("../middleware/authMiddleware");

// 🔐 PROTECTED ROUTE (CREATE ORDER)
router.post("/", authMiddleware, createOrder);

// 🔐 PROTECTED ROUTE (GET ORDERS)
router.get("/", authMiddleware, getOrders);

router.patch("/:id/status", updateOrderStatus);
module.exports = router;