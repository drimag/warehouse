const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateSessionToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' } // Token automatically expires after 12 hours
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name);

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check if email already exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    // Generate token so they're logged in immediately after registering
    const token = generateSessionToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: "Internal Registration Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email credentials or password" });
    }

    const token = generateSessionToken(user);
    res.status(200).json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Internal Authentication System Error" });
  }
};