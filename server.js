import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database setup
let db;
async function setupDatabase() {
    try {
        // Open the database
        db = await open({
            filename: 'auth.db',
            driver: sqlite3.Database
        });
        
        // Create users table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('Database setup complete');
    } catch (error) {
        console.error('Database setup error:', error);
    }
}

// Routes
app.post('/api/register', async (req, res) => {
    try {
        console.log('Register request received:', req.body);
        const { email, password } = req.body;
        
        // Collect all validation errors
        const errors = {};
        
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            errors.email = 'You need to provide a valid (youremail@example.com) email address.';
        }
        
        // Validate password format
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            errors.password = 'The password you entered does not meet the minimum complexity requirements (min. 8 characters, min. 1 digit, min. 1 uppercase letter), please create another one.';
        }
        
        // If format validation errors, return errors
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors
            });
        }
        
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Check if user already exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        
        res.json({
            success: true,
            exists: !!existingUser
        });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        await db.run(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        
        // Get the created user
        const user = await db.get('SELECT id, email FROM users WHERE email = ?', [email]);
        
        // Create session
        req.session.userId = user.id;
        
        console.log('User registered successfully:', email);
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { email, password } = req.body;
        
        // Collect all validation errors
        const errors = {};
        
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            errors.email = 'You need to provide a valid (youremail@example.com) email address.';
        }
        
        // Validate password format
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            errors.password = 'The password you entered does not meet the minimum complexity requirements (min. 8 characters, min. 1 digit, min. 1 uppercase letter).';
        }
        
        // If format validation errors, return errors
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors
            });
        }
        
        // Find user
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ 
                success: false, 
                message: 'Email not found',
                errorType: 'email',
                errors: {
                    email: 'The email address you entered is not associated with an account, please sign up first.'
                }
            });
        }
        
        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid password',
                errorType: 'password',
                errors: {
                    password: 'The password you entered is incorrect, please try again.'
                }
            });
        }
        
        // Create session
        req.session.userId = user.id;
        
        console.log('User logged in successfully:', email);
        res.json({ 
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

app.get('/api/user', async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }
        
        // Get user data
        const user = await db.get(
            'SELECT id, email, created_at FROM users WHERE id = ?',
            [req.session.userId]
        );
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.clearCookie('connect.sid');
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Start server and setup database
async function startServer() {
    try {
        await setupDatabase();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
    }
}

startServer();