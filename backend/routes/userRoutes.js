const authMiddleware = require("../middleware/authMiddleware");const express = require("express");
const router = express.Router();

const {
    createUser,
    getUsers
} = require("../controllers/userController");

// USER ROUTES ONLY
router.post("/", createUser); // public (register)

router.get("/", authMiddleware, getUsers); // protected

module.exports = router;