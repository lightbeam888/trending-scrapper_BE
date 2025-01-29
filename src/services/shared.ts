import {TG_API_HASH, TG_API_ID, TRENDING_SOURCES} from "../constants";
import { exec } from 'child_process';
// @ts-ignore
//import { MTProto } from '@mtproto/core';
const MTProto = require('@mtproto/core');

const mtproto = new MTProto({
    api_id: Number(TG_API_ID),
    api_hash: TG_API_HASH,
    storageOptions: {
        path: '../session'
    }
});

export async function runIntervals() {
    Object.keys(TRENDING_SOURCES).map(async (source: string) => {
        try {
            const interval = Number(TRENDING_SOURCES[source].frequency) * 1000;
            const parser = require(`./parsers/${source}`).parser;
            if (interval > 0 && parser) {
                // debug
                await parser(source, TRENDING_SOURCES[source]);
                setInterval(async () => {
                    console.log(new Date(), `Running interval for ${source}`);
                    await parser(source, TRENDING_SOURCES[source]);
                    console.log(new Date(), `Completed interval for ${source}`);
                }, interval);
            }
        } catch (e) {
            console.log("E: fatal runIntervals for", source, e);
        }
    });
}

export const convertMarketCap = (marketCapRaw: string | undefined): number => {
    if (!marketCapRaw) return 0;

    // Regular expression to extract the numeric part and suffix
    const match = marketCapRaw.match(/^([\d.,]+)\s*([kKmMB]?)$/);

    if (!match) return 0;

    let [, numberStr, suffix] = match;
    let number = parseFloat(numberStr.replace(/,/g, '')); // Remove commas and parse number

    // Convert based on suffix
    switch (suffix.toLowerCase()) {
        case 'k':
            number *= 1_000;
            break;
        case 'm':
            number *= 1_000_000;
            break;
        case 'b':
            number *= 1_000_000_000;
            break;
        // Add more cases if needed for other suffixes
        default:
            // No suffix or unsupported suffix
            break;
    }

    return number;
};

export const getChannelInfo = async (channel_username: string): Promise<{
    channel_id: number,
    access_hash: string
}> => {
    try {
        const result = await mtproto.call('contacts.resolveUsername', {
            username: channel_username  // The public channel's username
        });

        const channel = result.chats[0];  // First chat result, usually the channel
        return {
            channel_id: channel.id,         // The channel's ID
            access_hash: channel.access_hash // The channel's access hash (even for public channels)
        };
    } catch (error) {
        console.error('Error resolving username:', error);
        throw error;
    }
};

// Function to retrieve a specific message from a public channel
export const getSpecificMessage = async (): Promise<void> => {
    try {
        console.log("getSpecificMessage");
//     const { channel_id, access_hash } = await getChannelInfo("SOLTRENDING");  // Get the channel info
// console.log("channel_id", channel_id, "access_hash", access_hash);
        // // Now call 'messages.getMessages' to fetch the specific message
        console.log(mtproto);
        const result = await mtproto.call('messages.getMessages', {
            peer: {
                _: 'inputPeerChannel',     // Specify the peer as a channel
                channel_id: "SOLTRENDING",    // The ID of the channel
            },
            id: [3986526]             // The ID of the message you want to retrieve
        });

        console.log(result);  // Log the message result
    } catch (error) {
        console.error('Error fetching the message:', error);
    }
};

export const fetchDataWithPython = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Construct the command to run the Python script
        const command = `python3 RUNNERS/cloudflare.py ${url}`;

        // Execute the Python script
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing Python script:', error);
                return reject(error);
            }

            if (stderr) {
                console.error('Python script stderr:', stderr);
                return reject(new Error(stderr));
            }

            // Resolve with the script output (stdout)
            resolve(stdout);
        });
    });
};