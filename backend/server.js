require('dotenv').config();

// Log Auth0 environment variables
console.log("AUTH0_SECRET is set:", !!process.env.AUTH0_SECRET);
console.log("AUTH0_BASE_URL:", process.env.AUTH0_BASE_URL);
console.log("AUTH0_CLIENT_ID:", process.env.AUTH0_CLIENT_ID);
console.log("AUTH0_CLIENT_SECRET is set:", !!process.env.AUTH0_CLIENT_SECRET);
console.log("AUTH0_ISSUER_BASE_URL:", process.env.AUTH0_ISSUER_BASE_URL);

const path = require('path'); // Import path module
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb'); // <-- Ensure this is imported

const app = express();
const port = process.env.PORT || 3000;

// Critical Auth0 configuration checks
if (!process.env.AUTH0_SECRET) {
  console.error('CRITICAL ERROR: AUTH0_SECRET is not defined or empty. Please check your .env file or environment variables.');
  process.exit(1);
}
if (!process.env.AUTH0_BASE_URL) {
  console.error('CRITICAL ERROR: AUTH0_BASE_URL is not defined or empty. Please check your .env file or environment variables.');
  process.exit(1);
}
if (!process.env.AUTH0_CLIENT_ID) {
  console.error('CRITICAL ERROR: AUTH0_CLIENT_ID is not defined or empty. Please check your .env file or environment variables.');
  process.exit(1);
}
if (!process.env.AUTH0_ISSUER_BASE_URL) {
  console.error('CRITICAL ERROR: AUTH0_ISSUER_BASE_URL is not defined or empty. Please check your .env file or environment variables.');
  process.exit(1);
}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.use(auth(config));
app.use(express.json());

// Serve static files from the 'public' directory (one level up from 'backend', then into 'public')
app.use(express.static(path.join(__dirname, '..', 'public')));

/*
app.get('/', (req, res) => {
  let responseText = '<h1>Welcome!</h1>';
  if (req.oidc.isAuthenticated()) {
    responseText += '<p>Logged in as: ' + req.oidc.user.name + ' (' + req.oidc.user.email + ')</p>';
    responseText += '<a href="/profile">View Profile</a><br>';
    responseText += '<a href="/api/logs">View Logs (API)</a><br>'; // Link to see logs
    responseText += '<a href="/logout">Logout</a>';
  } else {
    responseText += '<a href="/login">Login</a>';
  }
  res.send(responseText);
});
*/

app.get('/profile', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

// --- API Routes for Logs ---

// GET /api/logs - Retrieve all logs for the authenticated user
app.get('/api/logs', requiresAuth(), async (req, res) => {
    try {
        const db = getDb();
        const userId = req.oidc.user.sub;
        const logs = await db.collection('logs').find({ userId: userId }).sort({ eventTime: -1 }).toArray();
        res.json(logs);
    } catch (err) {
        console.error('Failed to get logs:', err);
        res.status(500).json({ message: 'Failed to retrieve logs', error: err.message });
    }
});

// POST /api/logs - Create a new log for the authenticated user
app.post('/api/logs', requiresAuth(), async (req, res) => {
    try {
        const db = getDb();
        const userId = req.oidc.user.sub;
        const { eventType, eventTime } = req.body;

        if (!eventType || !eventTime) {
            return res.status(400).json({ message: 'Missing eventType or eventTime in request body' });
        }

        const newLog = {
            userId: userId,
            eventType: eventType,
            eventTime: new Date(eventTime),
            createdAt: new Date()
        };

        const result = await db.collection('logs').insertOne(newLog);
        const insertedDoc = { ...newLog, _id: result.insertedId };
        res.status(201).json(insertedDoc);

    } catch (err) {
        console.error('Failed to create log:', err);
        res.status(500).json({ message: 'Failed to create log', error: err.message });
    }
});

// DELETE /api/logs/:id - Delete a specific log for the authenticated user
app.delete('/api/logs/:id', requiresAuth(), async (req, res) => {
    try {
        const db = getDb();
        const userId = req.oidc.user.sub;
        const logId = req.params.id;

        if (!ObjectId.isValid(logId)) {
            return res.status(400).json({ message: 'Invalid log ID format' });
        }

        const result = await db.collection('logs').deleteOne({ _id: new ObjectId(logId), userId: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Log not found or user not authorized to delete' });
        }

        res.status(200).json({ message: 'Log deleted successfully' }); // Changed to 200 from 204 as we send a message
    } catch (err) {
        console.error('Failed to delete log:', err);
        res.status(500).json({ message: 'Failed to delete log', error: err.message });
    }
});

// Connect to DB and then start server
connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
        console.log('Test API endpoints using a tool like Postman or curl after logging in.');
        console.log('Ensure your .env file is correctly set up with Auth0 and MongoDB credentials.');
    });
}).catch(err => {
    console.error('Failed to connect to database before starting server:', err);
    process.exit(1);
});
