# Aparichit - Message Submission System
## Complete Setup & Usage Guide

---

## 🚀 QUICK START

### Step 1: Install Dependencies
Open PowerShell in your project folder (`e:\DandPakam\DandPakam`) and run:
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
✓ Server running at http://localhost:5500
✓ Messages stored in: [path]\messages.json
✓ Admin Dashboard: http://localhost:5500/admin-login.html
```

---

## 📋 USER ACCESS POINTS

### 1. **Submit Messages** (Public)
- **URL:** `http://localhost:5500/Request.html`
- Users can submit complaints/messages
- Messages are automatically saved to the database

### 2. **Admin Dashboard** (Protected)
- **URL:** `http://localhost:5500/admin-login.html`
- **Default Password:** `aparichit2024`
- View all submitted messages
- Export messages as JSON
- Search messages
- Real-time statistics

---

## ⚙️ CONFIGURATION

### Change Admin Password (⚠️ IMPORTANT)

1. Open `server.js`
2. Go to line 12 (~):
```javascript
const ADMIN_PASSWORD = 'aparichit2024'; // Change this to your secure password
```
3. Change to your desired password
4. Save and restart the server

---

## 📁 FILE STRUCTURE

```
DandPakam/
├── index.html                 # Home page
├── Request.html              # Submission form
├── Confirmation.html         # Confirmation page
├── admin.html                # Admin dashboard
├── admin-login.html          # Admin login page
├── script.js                 # Form submission logic
├── server.js                 # Backend server
├── package.json              # Dependencies
├── messages.json             # Database (auto-created)
├── [Audios/]                 # Audio files directory
├── [Images/]                 # Images directory
└── [Videos/]                 # Videos directory
```

---

## 📊 STORED MESSAGE FORMAT

Each message in `messages.json` contains:
```json
{
  "id": 1709845612345,
  "message": "User's message text here",
  "timestamp": "2026-03-07T10:30:12.345Z",
  "ip": "127.0.0.1"
}
```

---

## 🔑 API ENDPOINTS

### Public Endpoints

**Submit Message**
```
POST /api/submit-message
Content-Type: application/json

{
  "message": "User's message here"
}

Response:
{
  "success": true,
  "message": "Message stored successfully",
  "id": 1709845612345
}
```

### Protected Endpoints (Requires Admin Token)

**Get All Messages**
```
GET /api/messages
Authorization: Bearer [token]

Response: Array of message objects
```

**Delete Message**
```
DELETE /api/messages/:id
Authorization: Bearer [token]
```

**Clear All Messages**
```
POST /api/messages/clear-all
Authorization: Bearer [token]
```

---

## 🔐 SECURITY NOTES

1. **Change the default password** before deploying to production
2. The `messages.json` file contains all user messages - back it up regularly
3. For production, upgrade to:
   - Use bcrypt for password hashing
   - Use JWT tokens properly
   - Add HTTPS/SSL
   - Use a real database (MongoDB, PostgreSQL, etc.)

---

## 🐛 TROUBLESHOOTING

### "Error submitting message. Make sure server is running!"
- Verify server is running: `npm start`
- Check if port 5500 is available
- Clear browser cache and reload

### Admin dashboard shows "Error loading messages"
- Check if you're logged in
- Verify browser console for errors (F12)
- Check if messages.json exists and is readable

### Server won't start
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Ensure Node.js is installed: `node --version`

---

## 📈 MONITORING & STATISTICS

The admin dashboard shows:
- **Total Messages:** All messages ever submitted
- **Today's Messages:** Messages from the current day
- **Real-time Search:** Search through all messages
- **Export Function:** Download all messages as JSON

---

## 🌐 DEPLOYMENT

### For Local Testing:
Just run `npm start` - works on Windows, Mac, Linux

### For Production Deployment:
1. Change admin password
2. Use environment variables for secrets
3. Deploy on cloud services (AWS, Heroku, etc.)
4. Switch to a real database
5. Enable HTTPS
6. Add rate limiting and input validation

---

## 📞 QUICK REFERENCE

| Action | Link | Password |
|--------|------|----------|
| Submit Message | http://localhost:5500/Request.html | None |
| View Admin Dashboard | http://localhost:5500/admin-login.html | aparichit2024 |
| View all messages (JSON) | http://localhost:5500/api/messages | Requires auth |

---

## ✅ VERIFICATION CHECKLIST

- [ ] Installed dependencies: `npm install`
- [ ] Server started: `npm start`
- [ ] Can access form: http://localhost:5500/Request.html
- [ ] Can submit a test message
- [ ] Can access admin login: http://localhost:5500/admin-login.html
- [ ] Can login with password
- [ ] Can see submitted message in dashboard
- [ ] Changed default admin password
- [ ] Backed up messages.json

---

**Happy Deployment! 🚀**
