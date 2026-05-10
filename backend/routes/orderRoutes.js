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

const roleMiddleware = require("../middleware/roleMiddleware");

//PROTECTED ROUTE (CREATE ORDER)
router.post("/", authMiddleware, roleMiddleware("user", "admin", createOrder);

//PROTECTED ROUTE (GET ORDERS)
router.get("/", authMiddleware, getOrders);

//UPDATE ORDERS
router.patch("/:id/status", authMiddleware, roleMiddleware("admin", "driver"), updateOrderStatus);

//ASSIGN DRIVER
router.patch("/:id/assign", assignDriver);

//GET DRIVER ORDERS
router.get("/driver/:driver_id", authMiddleware, roleMiddleware("driver"), getDriverOrders);

router.patch("/:id/assign", authMiddleware, roleMiddleware("admin"), assignDriver);
module.exports = router;