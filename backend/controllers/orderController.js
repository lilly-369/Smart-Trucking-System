const pool = require("../config/db");

// CREATE ORDER
const createOrder = async (req, res) => {
    const { pickup_location, destination, cargo_type, price } = req.body;

    const user_id = req.user.id; // comes from JWT

    try {
        const result = await pool.query(
            `INSERT INTO orders (user_id, pickup_location, destination, cargo_type, price)
             VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
            [user_id, pickup_location, destination, cargo_type, price]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating order" });
    }
};

// GET ALL ORDERS
const getOrders = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching orders" });
    }
};

// UPDATE ORDER STATUS (ONLY ASSIGNED DRIVER CAN UPDATE)
const updateOrderStatus = async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const driverId = req.user.id; // from JWT

    try {

        // Get the order
        const orderResult = await pool.query(
            "SELECT * FROM orders WHERE id = $1",
            [id]
        );

        const order = orderResult.rows[0];

        // Check if order exists
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // SECURITY CHECK: only assigned driver can update
        if (order.driver_id !== driverId) {
            return res.status(403).json({
                message: "You are not assigned to this order"
            });
        }

        // Allowed status flow
        const allowedTransitions = {
            assigned: ["in_transit"],
            in_transit: ["delivered"],
            delivered: []
        };

        if (!allowedTransitions[order.status].includes(status)) {
            return res.status(400).json({
                message: `Invalid status change from ${order.status} to ${status}`
            });
        }

        // Update status
        const updated = await pool.query(
            "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        res.json(updated.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error updating status"
        });
    }
};

//ASSIGN DRIVERS
const assignDriver = async (req, res) => {
    const { id } = req.params;
    const { driver_id } = req.body;

    const result = await pool.query(
        "UPDATE orders SET driver_id = $1, status = 'assigned' WHERE id = $2 RETURNING *",
        [driver_id, id]
    );

    res.json(result.rows[0]);
};

// GET DRIVER ORDERS
const getDriverOrders = async (req, res) => {

    // Get driver ID from URL
    const { driver_id } = req.params;

    try {

        // Fetch orders assigned to specific driver
        const result = await pool.query(
            `
            SELECT *
            FROM orders

            WHERE driver_id = $1

            ORDER BY created_at DESC
            `,
            [driver_id]
        );

        // Return driver's assigned orders
        res.json(result.rows);

    } catch (err) {

        // Show error in terminal
        console.error(err);

        // Return error response
        res.status(500).json({
            message: "Error fetching driver orders"
        });
    }
};

// GET LOGGED-IN DRIVER'S ORDERS
const getMyDriverOrders = async (req, res) => {

    // Get driver ID from JWT token
    const driver_id = req.user.id;

    try {

        // Fetch only orders assigned to this driver
        const result = await pool.query(
            `SELECT * FROM orders
             WHERE driver_id = $1
             ORDER BY created_at DESC`,
            [driver_id]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Error fetching driver orders"
        });
    }
};

// DRIVER STARTS DELIVERY
const startDelivery = async (req, res) => {

    const { id } = req.params;
    const driverId = req.user.id;

    try {

        // Get order
        const order = await pool.query(
            "SELECT * FROM orders WHERE id = $1",
            [id]
        );

        // Check ownership
        if (order.rows[0].driver_id !== driverId) {
            return res.status(403).json({
                message: "Not your assigned order"
            });
        }

        // Update start time + status
        const result = await pool.query(
            `UPDATE orders
             SET status = 'in_transit',
                 started_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Error starting delivery"
        });
    }
};

// DRIVER COMPLETES DELIVERY
const completeDelivery = async (req, res) => {

    const { id } = req.params;
    const driverId = req.user.id;

    try {

        const order = await pool.query(
            "SELECT * FROM orders WHERE id = $1",
            [id]
        );

        if (order.rows[0].driver_id !== driverId) {
            return res.status(403).json({
                message: "Not your assigned order"
            });
        }

        const result = await pool.query(
            `UPDATE orders
             SET status = 'delivered',
                 delivered_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Error completing delivery"
        });
    }
};

// GET ACTIVE DELIVERY FOR LOGGED-IN DRIVER
const getActiveDelivery = async (req, res) => {

    const driverId = req.user.id;

    try {

        // Find ONLY the active job (in_transit)
        const result = await pool.query(
            `SELECT *
             FROM orders
             WHERE driver_id = $1
             AND status = 'in_transit'
             LIMIT 1`,
            [driverId]
        );

        // If no active job
        if (result.rows.length === 0) {
            return res.json({
                message: "No active delivery"
            });
        }

        // Return active job
        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Error fetching active delivery"
        });
    }
};

// GET ALL DELIVERIES FOR TODAY
const getTodayDeliveries = async (req, res) => {

    const driverId = req.user.id;

    try {

        const result = await pool.query(
            `SELECT *
             FROM orders
             WHERE driver_id = $1
             AND DATE(created_at) = CURRENT_DATE
             ORDER BY created_at DESC`,
            [driverId]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Error fetching today's deliveries"
        });
    }
};

// GET COMPLETED DELIVERIES
const getCompletedDeliveries = async (req, res) => {

    const driverId = req.user.id;

    try {

        const result = await pool.query(
            `SELECT *
             FROM orders
             WHERE driver_id = $1
             AND status = 'delivered'
             ORDER BY delivered_at DESC`,
            [driverId]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Error fetching completed deliveries"
        });
    }
};

// GET DRIVER DASHBOARD STATS
const getDriverStats = async (req, res) => {

    const driverId = req.user.id;

    try {

        // Count completed deliveries
        const completed = await pool.query(
            `SELECT COUNT(*) 
             FROM orders
             WHERE driver_id=$1
             AND status='delivered'`,
            [driverId]
        );

        // Count active deliveries
        const active = await pool.query(
            `SELECT COUNT(*)
             FROM orders
             WHERE driver_id=$1
             AND status='in_transit'`,
            [driverId]
        );

        // Sum today's earnings
        const earnings = await pool.query(
            `SELECT COALESCE(SUM(price),0)
             FROM orders
             WHERE driver_id=$1
             AND status='delivered'
             AND DATE(delivered_at)=CURRENT_DATE`,
            [driverId]
        );

        res.json({
            completed_deliveries:
            completed.rows[0].count,

            active_deliveries:
            active.rows[0].count,

            earnings_today:
            earnings.rows[0].coalesce
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error fetching stats"
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    assignDriver,
    getDriverOrders,
    getMyDriverOrders,
    startDelivery,
    completeDelivery,
    getActiveDelivery,
    getTodayDeliveries,
    getCompletedDeliveries,
    getDriverStats
};