const jwt = require("jsonwebtoken");

// Verifies that the user has a valid login token session
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extracts "Bearer <token>"

  // ⚡ SEAMLESS TESTING BYPASS
  // If the incoming token matches our local React mock token string,
  // immediately log them in as an Admin—no cross-env setup needed!
  // if (token === "dev_testing_mock_jwt_token_payload") {
  //   req.user = {
  //     userId: 1, // Matches your database seeded Admin ID
  //     email: "admin@company.com",
  //     role: "ADMIN",
  //   };
  //   return next();
  // }

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access Denied: Session token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Injects { userId, email, role } payload directly into request context
    next();
  } catch (err) {
    return res.status(403).json({ error: "Session expired or invalid token" });
  }
};

// Verifies that the logged-in user matches the roles required for an API endpoint
const restrictToRoles = (...permittedRoles) => {
  return (req, res, next) => {
    if (!req.user || !permittedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access Denied: Insufficient authorization level" });
    }
    next();
  };
};

module.exports = { authenticateToken, restrictToRoles };
