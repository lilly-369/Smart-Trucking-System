const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

//MIDDLEWARE
// Enable JSON body parsing
app.use(express.json());

// Enable CORS
app.use(cors());

//TEST ROUTE
app.get("/", (req, res) => {
    res.send("Smart Trucking Backend Running");
});

//DATABASE CONNECTION TEST
pool.connect()
    .then(() => console.log("PostgreSQL Connected"))
    .catch(err => console.error("DB Error:", err));

//AUTH ROUTES
app.use("/api/auth", authRoutes);

//USER ROUTES
app.use("/api/users", userRoutes);

//ORDER ROUTES
app.use("/api/orders", orderRoutes);

//ADMIN ROUTES
app.use("/api/admin", adminRoutes);


//START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});