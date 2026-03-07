const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const MONGODB_URI = process.env.MONGODB_URI;

// Cached connection for Serverless environments
let cachedDb = null;

async function connectDB() {
    if (cachedDb) {
        return cachedDb;
    }
    if (!MONGODB_URI) {
        console.warn("WARNING: MONGODB_URI is not set!");
        return null;
    }

    try {
        console.log('Connecting to MongoDB...');
        const db = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Error out quickly instead of hanging
        });
        cachedDb = db;
        console.log('Successfully connected to MongoDB.');
        return db;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}

// Define Schema and Model
const messageSchema = new mongoose.Schema({
    name: String,
    message: String,
    timestamp: String,
    timestampInMs: Number
});
const Message = mongoose.model('Message', messageSchema);

// Endpoint to handle form submissions
app.post('/api/submit-message', async (req, res) => {
    try {
        // IMPORTANT: Must await database connection inside the serverless function
        await connectDB();

        const { name, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ success: false, error: 'Name and message are required' });
        }

        const newMessage = new Message({
            name: name,
            message: message,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            timestampInMs: Date.now()
        });

        if (MONGODB_URI) {
            await newMessage.save();
            console.log('Saved to MongoDB:', newMessage);
        } else {
            console.log('Simulation (MongoDB not configured): Would have saved:', newMessage);
        }

        res.json({ success: true, message: 'Message securely saved to database' });

    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, error: 'Failed to save message. Check server logs.' });
    }
});

// API to delete a specific complaint
app.delete('/api/delete-message/:id', async (req, res) => {
    try {
        await connectDB();
        const result = await Message.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Message not found' });
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

// Secret link to view complaints directly in the browser
app.get('/view-complaints-secret', async (req, res) => {
    try {
        if (!MONGODB_URI) {
            return res.send(`
                <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                    <h2>MongoDB is not configured yet!</h2>
                    <p>To view your complaints here, please add your <b>MONGODB_URI</b> to your Vercel Environment Variables.</p>
                </div>
            `);
        }

        // IMPORTANT: Must await connection inside the serverless function
        await connectDB();

        const messages = await Message.find().sort({ timestampInMs: -1 });

        let htmlResponse = `
            <html>
            <head>
                <title>Secret Complaints Viewer</title>
                <style>
                    body { font-family: monospace; background: #111; color: #0f0; padding: 20px; line-height: 1.6; }
                    h1 { color: #fff; border-bottom: 2px solid #555; padding-bottom: 10px; }
                    .complaint { background: #222; padding: 20px; margin-bottom: 20px; border-left: 5px solid #0f0; border-radius: 5px; position: relative; }
                    .name { font-weight: bold; font-size: 1.3em; color: #fff; margin-bottom: 5px;}
                    .time { color: #888; font-size: 0.9em; margin-bottom: 15px;}
                    .msg { color: #ddd; font-size: 1.1em; white-space: pre-wrap; background: #1a1a1a; padding: 15px; border-radius: 4px;}
                    .no-messages { color: #888; font-size: 1.2em; font-style: italic; }
                    .delete-btn { position: absolute; top: 10px; right: 10px; background: #ff3333; color: #fff; border: none; padding: 6px 14px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 0.9em; }
                    .delete-btn:hover { background: #cc0000; }
                </style>
            </head>
            <body>
                <h1>Confidential Complaints Database</h1>
                <p>Total Complaints: ${messages.length}</p>
                <br>
        `;

        if (messages.length === 0) {
            htmlResponse += '<div class="no-messages">No complaints have been submitted yet.</div>';
        } else {
            messages.forEach(msg => {
                htmlResponse += `
                    <div class="complaint" id="complaint-${msg._id}">
                        <button class="delete-btn" onclick="deleteComplaint('${msg._id}')">🗑 DELETE</button>
                        <div class="name">👤 Name: ${msg.name || 'Anonymous'}</div>
                        <div class="time">🕒 Date: ${msg.timestamp}</div>
                        <div class="msg">${msg.message}</div>
                    </div>
                `;
            });
        }

        htmlResponse += `
                <script>
                    async function deleteComplaint(id) {
                        if (!confirm('Are you sure you want to delete this complaint?')) return;
                        try {
                            const res = await fetch('/api/delete-message/' + id, { method: 'DELETE' });
                            const data = await res.json();
                            if (data.success) {
                                document.getElementById('complaint-' + id).remove();
                            } else {
                                alert('Failed to delete: ' + (data.error || 'Unknown error'));
                            }
                        } catch(e) {
                            alert('Error deleting complaint');
                        }
                    }
                </script>
            </body></html>`;
        res.send(htmlResponse);

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send("Error reading database. Please check server logs.");
    }
});

// Fallback to serving the frontend files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Export the express API for Vercel
module.exports = app;

// Only listen on a port if run directly (local development)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
