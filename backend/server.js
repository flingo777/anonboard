// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Increase JSON payload limit to 50MB (for data URLs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend files (for local testing)
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup (using database.js)
const db = require('./database');

// --- API Endpoints ---

// Generate Random Username
app.get('/api/username', (req, res) => {
    const username = `Anonymous_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    res.json({ username });
});

// Get All Threads
app.get('/api/threads', (req, res) => {
    db.getAllThreads((err, threads) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(threads);
    });
});

// Create New Thread (handles image and video data URLs)
app.post('/api/threads', (req, res) => {
    const { username, title, content, captcha, imageData, videoData } = req.body;

    // Simple Captcha Validation
    if (captcha !== '42') {
        return res.status(400).json({ error: 'Captcha verification failed.' });
    }

    db.createThread(username, title, content, imageData, videoData, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Thread created successfully!' });
    });
});

// Get Comments for a Thread
app.get('/api/threads/:threadId/comments', (req, res) => {
    const threadId = req.params.threadId;
    db.getCommentsByThreadId(threadId, (err, comments) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(comments);
    });
});

// Create New Comment
app.post('/api/threads/:threadId/comments', (req, res) => {
    const threadId = req.params.threadId;
    const { username, content, captcha } = req.body;

    // Simple Captcha Validation
    if (captcha !== '42') {
        return res.status(400).json({ error: 'Captcha verification failed.' });
    }

    db.createComment(threadId, username, content, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Comment created successfully!' });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});