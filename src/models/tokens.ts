import {mongoClient} from '../services/db/client';

interface Model {
    addedAt: string;              // JS UTC date string
    address: string;              // Token address
    network: string;              // Network name
}

const modelName = 'tokens';

export const tokensModel = mongoClient.db().collection<Model>(modelName);