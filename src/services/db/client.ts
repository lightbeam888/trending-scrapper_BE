import {MongoClient, MongoNetworkTimeoutError} from 'mongodb';
import {MONGO_CONNECTION, MONGO_PASS, MONGO_USER} from "../../constants";

// Create a MongoDB client
const mongoClient = new MongoClient(MONGO_CONNECTION, {
    auth: {
        username: MONGO_USER,
        password: MONGO_PASS
    },
    authSource: 'admin',
    ssl: false,
    tls: false,
    directConnection: true,
    replicaSet: 'rs0',
    serverSelectionTimeoutMS: 10000, // Increase server selection timeout to 60 seconds
    socketTimeoutMS: 600000, // Increase socket timeout to 10 minutes
    connectTimeoutMS: 30000,
});

// Function to connect to MongoDB
async function connectToMongo() {
    try {
        // Connect to MongoDB
        await mongoClient.connect();

        // Monitor the connection
        mongoClient.on('close', () => {
            console.error(new Date(), 'MongoDB connection closed');
            // Attempt to reconnect immediately
            connectToMongo();
        });

        mongoClient.on('error', (error) => {
            console.error(new Date(), 'MongoDB connection error:', error);
            // Attempt to reconnect after a delay
            setTimeout(connectToMongo, 2000); // Retry after 5 seconds
        });
    } catch (error) {
        console.error(new Date(), 'Error connecting to MongoDB:', error);
    }
}

export async function retryAsync<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error) {
            if (error instanceof MongoNetworkTimeoutError) {
                attempt++;
                if (attempt < retries) {
                    console.log(`Retry attempt ${attempt} failed. Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    throw new Error(`Failed after ${retries} attempts: ${error.message}`);
                }
            } else {
                throw error;
            }
        }
    }
    throw new Error('Unexpected error');
}

// Call the connectToMongo function to establish the connection
connectToMongo();

// Export the connected MongoDB client
export {mongoClient};