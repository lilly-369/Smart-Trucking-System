const pool = require("../config/db");

// ADMIN DASHBOARD STATS
const getAdminStats = async (req, res) => {

    try {

        // TOTAL USERS
        const users = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        // TOTAL DRIVERS
        const drivers = await pool.query(
            `SELECT COUNT(*)
             FROM users
             WHERE role='driver'`
        );

        // TOTAL ORDERS
        const orders = await pool.query(
            "SELECT COUNT(*) FROM orders"
        );

        // ACTIVE DELIVERIES
        const active = await pool.query(
            `SELECT COUNT(*)
             FROM orders
             WHERE status='in_transit'`
        );

        // COMPLETED DELIVERIES
        const completed = await pool.query(
            `SELECT COUNT(*)
             FROM orders
             WHERE status='delivered'`
        );

        // TOTAL REVENUE
        const revenue = await pool.query(
            `SELECT COALESCE(SUM(price),0)
             FROM orders
             WHERE status='delivered'`
        );

        res.json({
            total_users: users.rows[0].count,
            total_drivers: drivers.rows[0].count,
            total_orders: orders.rows[0].count,
            active_deliveries: active.rows[0].count,
            completed_deliveries: completed.rows[0].count,
            total_revenue: revenue.rows[0].coalesce
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Error fetching admin stats"
        });
    }
};

module.exports = {
    getAdminStats
};