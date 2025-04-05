const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection with error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/historical-blogs', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Don't exit the process, just log the error
        // The application can still serve static files
    }
};

// Connect to MongoDB
connectDB();

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    date: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

// Routes
app.get('/api/blogs', async (req, res) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ message: 'Database connection not available' });
        }
        const blogs = await Blog.find().sort({ date: -1 });
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
});

app.post('/api/blogs', async (req, res) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ message: 'Database connection not available' });
        }
        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(400).json({ message: 'Error creating blog', error: error.message });
    }
});

// Contact form schema
const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    subject: String,
    message: String
});

const Contact = mongoose.model('Contact', contactSchema);

app.post('/api/contact', async (req, res) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(500).json({ message: 'Database connection not available' });
        }
        const contact = new Contact(req.body);
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(400).json({ message: 'Error saving contact', error: error.message });
    }
});

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ message: 'API endpoint not found' });
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Function to start server
const startServer = (port) => {
    try {
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Visit http://localhost:${port} to view the application`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error('Server error:', error);
            }
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

// Start server with initial port
const PORT = process.env.PORT || 3000;
startServer(PORT); 