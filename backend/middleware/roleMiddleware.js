/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of role strings that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // If no roles are specified, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      return next();
    }

    // Check if user is authenticated and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No user role found',
      });
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // User doesn't have required role
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: Insufficient permissions',
    });
  };
};

export default roleCheck;
