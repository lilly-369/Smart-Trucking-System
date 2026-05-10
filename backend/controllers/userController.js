const pool = require('../config/db');
const createUser = async (req, res) => {
    const { full_name, email, password, role } = req.body;

    try {
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [full_name, email, hashedPassword, role]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user" });
    }
};

const getUsers = async (req, res) => {
    try {

        const users = await pool.query(
            'SELECT * FROM users'
        );

        res.json(users.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = {
    createUser,
    getUsers
};