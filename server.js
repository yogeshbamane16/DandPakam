const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5500;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Ensure messages.json exists
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

// ==================== MIDDLEWARE ====================
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use(express.static(__dirname));

// ==================== ROUTES ====================

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is working!' });
});

// Submit message (PUBLIC)
app.post('/api/submit-message', (req, res) => {
    try {
        console.log('Message submission - Body:', req.body);

        const { name, message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, error: 'Message cannot be empty' });
        }

        const id = Date.now();
        const timestamp = new Date().toLocaleString();

        // Read existing messages
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        let messages = [];
        if (data) {
            messages = JSON.parse(data);
        }

        // Add new message
        const newMessage = {
            id,
            name: name || 'Unknown',
            message: message.trim(),
            timestamp
        };
        messages.push(newMessage);

        // Save back to file
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 4));

        console.log('✓ Message saved to file - ID:', id);
        res.json({
            success: true,
            message: 'Message stored successfully',
            id: id
        });
    } catch (error) {
        console.error('❌ Error storing message:', error);
        res.status(500).json({ success: false, error: 'Failed to store message: ' + error.message });
    }
});

// 404 Handler
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.path);
    res.status(404).json({ error: 'Route not found: ' + req.path });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log('\n=====================================');
    console.log('✓ 🚀 SERVER STARTED SUCCESSFULLY 🚀');
    console.log('=====================================');
    console.log(`✓ Running at: http://localhost:${PORT}`);
    console.log(`✓ Submit messages: http://localhost:${PORT}/index.html`);
    console.log(`✓ Complaints are saved in: messages.json`);
    console.log('=====================================\n');
});

process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION:', error);
});
