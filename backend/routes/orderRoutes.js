const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    updateOrderStatus,
    assignDriver,
    getDriverOrders
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

//PROTECTED ROUTE (CREATE ORDER)
router.post("/", authMiddleware, createOrder);

//PROTECTED ROUTE (GET ORDERS)
router.get("/", authMiddleware, getOrders);

//UPDATE ORDERS
router.patch("/:id/status", updateOrderStatus);

//ASSIGN DRIVER
router.patch("/:id/assign", assignDriver);

//GET DRIVER ORDERS
router.get("/driver/:driver_id", authMiddleware, getDriverOrders);

module.exports = router;