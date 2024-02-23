const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_KEY = 'mynameisdileep';

// ROUTE 1: Endpoint to create a user: POST "/api/auth/createuser" (No login required)
router.post('/createuser', [
    // Validation middleware for request body
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    let success = false;
    // Validate request body against defined rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation errors exist, return Bad Request and the error messages
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // Check if the user with this email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            // If the user already exists, return a 400 status with an error message
            return res.status(400).json({ success, error: "Sorry, a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user using the provided data
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_KEY);

        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        // Log and handle any unexpected errors
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Authenticate a user: POST "/api/auth/login" (No login required)
router.post('/login', [
    // Validation middleware for request body
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res) => {
    let success = false;
    const { email, password } = req.body;

    try {
        // Check if the user with this email exists
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            // If the user does not exist, return a 401 status with an error message
            return res.status(401).json({ success, error: "Try to login with correct credentials" });
        }

        // If the user exists, compare the passwords
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            // If passwords don't match, return a 401 status with an error message
            return res.status(401).json({ success, error: "Try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_KEY);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Get logged in user detils using: POST "/api/auth/getuser" (Login required)
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router;
