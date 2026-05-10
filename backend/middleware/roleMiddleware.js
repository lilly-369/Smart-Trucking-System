const roleMiddleware = (...allowedRoles) => {

    return (req, res, next) => {

        // Get user role from JWT (already decoded in authMiddleware)
        const userRole = req.user.role;

        // Check if user's role is allowed
        if (!allowedRoles.includes(userRole)) {

            return res.status(403).json({
                message: "Access denied: insufficient permissions"
            });
        }

        // If allowed, continue
        next();
    };
};

module.exports = roleMiddleware;