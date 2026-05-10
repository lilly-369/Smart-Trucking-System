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

module.exports = { createOrder, getOrders };