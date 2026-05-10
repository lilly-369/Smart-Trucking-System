const jwt = require("jsonwebtoken");



// VERIFY JWT TOKEN
const authMiddleware = (req, res, next) => {

    // Get authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];

    try {

        // Verify token using secret key
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "secretkey123"
        );

        // Store decoded user info in request
        req.user = decoded;

        // Allow access to protected route
        next();

    } catch (err) {

        // Invalid token response
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};



// EXPORT MIDDLEWARE
module.exports = authMiddleware;