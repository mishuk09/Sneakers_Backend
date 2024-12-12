const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file
const Auth = require('./Schema/Auth'); // Import the Auth model

const post = require('./Modules/Curd/Additems');
const authRoutes = require('./Modules/Curd/AuthRoutes'); // Import auth routes
const orderRoutes = require('./Modules/Curd/OrderManage'); // Import the Order routes
const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads')); // To serve static files
app.use(bodyParser.urlencoded({ extended: true }));

// Verify token middleware
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Token is valid
        req.userId = decoded.userId; // Attach userId to request object
        next();
    });
}

// Routes
app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Auth({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await Auth.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token, email, and name in the response
        res.status(200).json({
            token,
            email: user.email,
            name: user.firstName,  // Assuming 'name' exists in the user schema
            address: user.address  // Assuming 'name' exists in the user schema
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// Update user profile
app.put('/update-profile', verifyJWT, async (req, res) => {
    try {
        const { firstName, lastName, gender, email, address, mobile, newPassword } = req.body;
        const userId = req.userId;

        const updatedData = {
            firstName,
            lastName,
            gender,
            email,
            address,
            mobile
        };

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updatedData.password = hashedPassword;
        }

        const updatedUser = await Auth.findByIdAndUpdate(userId, updatedData, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});



// Use routes
app.use('/posts', post);
app.use('/auth', authRoutes); // Use the auth routes
app.use('/item', orderRoutes); // Use the order routes


// Dashboard

app.get('/dashboard', verifyJWT, async (req, res) => {
    try {
        // Fetch user data using the userId from the decoded JWT token
        const user = await Auth.findById(req.userId).select('-password'); // Exclude password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send user profile data as response
        res.status(200).json({ profile: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Protected route

app.get('/addpost', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Welcome to mqttp!' });
});
app.get('/update/:id', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Welcome to User!' });
});
app.get('/delete/:id', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Welcome to User!' });
});
app.get('/edit', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Welcome to User!' });
});
app.get('/delete', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Welcome to User!' });
});
app.get('/orders', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Welcome to User!' });
});



// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const crypto = require('crypto');

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(64).toString('hex');
    return secretKey;
};

module.exports = generateSecretKey;
