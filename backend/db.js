require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI not found in .env file. Please add it.');
}

const client = new MongoClient(uri);
let dbInstance;

async function connectToDb() {
    if (dbInstance) {
        return dbInstance;
    }
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB.');
        const urlParts = uri.split('/');
        const dbNameFromUri = urlParts[urlParts.length -1].split('?')[0];
        const dbNameToUse = dbNameFromUri && dbNameFromUri !== "" ? dbNameFromUri : "babyLogAppDb";
        
        dbInstance = client.db(dbNameToUse);

        if(dbNameToUse === "babyLogAppDb" && !uri.includes("babyLogAppDb")){
             console.log(`No database name found in MONGODB_URI, using default: "${dbNameToUse}"`)
        } else {
             console.log(`Using database: "${dbNameToUse}" from MONGODB_URI`)
        }
        return dbInstance;
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

function getDb() {
    if (!dbInstance) {
        throw new Error('DB not initialized. Call connectToDb first.');
    }
    return dbInstance;
}

module.exports = { connectToDb, getDb };
