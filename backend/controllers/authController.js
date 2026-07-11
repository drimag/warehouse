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
    const { fullName, email, employeeId, password } = req.body;

    // 1. Double-check mandatory requirements
    if (!fullName || !email || !employeeId || !password) {
      return res.status(400).json({ error: 'All registration parameters are strictly required.' });
    }

    // 2. Query database index to prevent duplicate account creation
    const existingUser = await userModel.findByEmailOrEmployeeId(email, employeeId);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'A node account with this email address or Employee ID already exists inside the system.' 
      });
    }

    // 3. Encrypt the secret pass phrase (10 salt rounds provides strong protection without lagging the CPU)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Commit data row changes to storage engine
    const newUser = await userModel.createNewUser({
      fullName,
      email: email.toLowerCase().trim(),
      employeeId: employeeId.toUpperCase().trim(),
      passwordHash: hashedPassword
    });

    // 5. Respond with success metadata (Exclude password hashes from transmission payloads!)
    return res.status(201).json({
      success: true,
      message: 'System account successfully indexed.',
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        employeeId: newUser.employee_id
      }
    });

  } catch (error) {
    console.error('Controller Transaction Exception:', error);
    return res.status(500).json({ error: 'Internal system fault detected during user write sequence.' });
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