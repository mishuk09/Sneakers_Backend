const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const verifyJWT = require('./verifyJWT'); // Import verifyJWT middleware
const User = require('./User'); // Import User model
const router = express.Router();

// Routes
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the user to MongoDB
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Protected route
// router.get('/dashboard', verifyJWT, (req, res) => {
//     res.status(200).json({ message: 'Welcome to Dashboard!' });
// });

module.exports = router;
