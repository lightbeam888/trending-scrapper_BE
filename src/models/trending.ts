import {mongoClient} from '../services/db/client';

interface Model {
    createdAt: Date;              // JS UTC date string
    address: string;              // Token address
    network: string;              // Network name
    source: string;               // Source name
    position: number;             // Position in the list
    extra: any;                   // Extra data
    version: number;              // Version number
}

const modelName = 'trending';

export const trendingModel = mongoClient.db().collection<Model>(modelName);

setTimeout(async () => {
    try {
        await trendingModel.createIndex({network: 1, address: 1});
        await trendingModel.createIndex({network: 1, source: 1, position: 1});
        await trendingModel.createIndex({version: 1});
        await trendingModel.createIndex({createdAt: -1}, {expireAfterSeconds: 864000});
    } catch (e) {
        console.log('E: fatal createIndex', modelName, e);
    }
});

// Get highest version number for a source and network
export async function getLatestVersion(source: string, network: string): Promise<number> {
    const latest = await trendingModel.findOne({source, network}, {sort: {version: -1}});
    return latest ? latest.version : 0;
}

// Get all trending tokens for a source and network by latest version and only for latest version
export async function getTrendingTokens(source: string, network: string): Promise<Model[]> {
    console.log('getTrendingTokens', source, network);
    const latest = await getLatestVersion(source, network);
    console.log('getTrendingTokens done', source, network, latest);
    return trendingModel.find({source, network, version: latest}, {sort: {position: 1}}).toArray();
}