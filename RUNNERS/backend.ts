import express from 'express';
import axios from 'axios';
import cors from 'cors';
import NodeCache from 'node-cache';
import path from 'path';
import {TRENDING_SOURCES} from "../src/constants";
import {getTrendingTokens, trendingModel} from "../src/models/trending";
import {tokensModel} from "../src/models/tokens";
import {mongoClient} from "../src/services/db/client";
import {runIntervals} from "../src/services/shared";

const app = express();
const PORT = process.env.PORT || 4001;
const cache = new NodeCache({stdTTL: 120, checkperiod: 120}); // Cache data for 600 seconds, check every 120 seconds

const allowedOrigins = [
    'http://localhost', // Local development
    'https://chub.0xlabs.dev',     // Production
    'https://apichub.0xlabs.dev'     // Production
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Allow cookies or authorization headers
}));

// Function to update the cache
const updateCache = async () => {
    try {
        console.log(new Date(), "updateCache started");
        await Promise.all(Object.keys(TRENDING_SOURCES).map(async (source) => {
            const tokens = await getTrendingTokens(source, TRENDING_SOURCES[source].network);

            if (tokens.length > 0) {
                // Update the cache with new data
                cache.set(source + '-' + TRENDING_SOURCES[source].network, tokens);
                console.log('Cache updated successfully', source, TRENDING_SOURCES[source].network, tokens.length);
            } else {
                console.log('No data available for', source, TRENDING_SOURCES[source].network);
            }
        }));
        console.log(new Date(), "updateCache completed")
    } catch (error) {
        console.error('Error updating cache:', error);
    }
};

const updateTokens = async () => {
    const all_trends = await trendingModel.find({}).toArray()
    for (const trend of all_trends) {
        const token = await tokensModel.findOne({address: trend.address})
        if (!token) {
            await tokensModel.insertOne({
                addedAt: new Date().toISOString(),
                address: trend.address,
                network: trend.network
            })
            continue;
        }
    }
}

mongoClient.once('open', async () => {
    try {
        console.log('Connected to mongo.');

        // Initial cache update
        await updateCache();
        // Update the tokens collection every 60 seconds
        setInterval(updateTokens, 5000);
        // Update the cache every 60 seconds
        setInterval(updateCache, 60000);
    } catch (e) {
        console.log("E:", e);
    }
});

// API endpoint to get shards status
app.get('/trending', (req, res) => {
    // Check request source and network
    const source = req.query.source;
    const network = req.query.network;

    if (!source || !network) {
        return res.status(400).send('Invalid request');
    }

    const cachedData = cache.get(source + '-' + network);
    if (cachedData) {
        return res.json(cachedData);
    } else {
        return res.status(500).send('No data available');
    }
});

// Serve the React frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Serve React frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
