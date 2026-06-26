const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// This handles the path: POST /api/auth/login
router.post('/login', authController.login);

router.post('/register', authController.register);

module.exports = router;