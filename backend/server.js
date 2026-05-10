const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const orderRoutes = require("./routes/orderRoutes");
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use(cors());


// test DB connection
pool.connect()
    .then(() => console.log("PostgreSQL Connected"))
    .catch(err => console.error("DB Error:", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// test route
app.get("/", (req, res) => {
    res.send("Smart Trucking Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});