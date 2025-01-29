import axios from 'axios';
import * as cheerio from 'cheerio';
import {convertMarketCap} from "../shared";
import {getLatestVersion, trendingModel} from "../../models/trending";

const NETWORK = "SOL";

export async function parser(source: string, settings: any) {
    console.log(new Date(), "I: parser started", source);

    const startTime = +new Date();

    let result: any[] = [];

    try {
        // Fetch the page content
        const {data} = await axios.get(settings.source);

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Select the message bubble with links
        const messageText = $('.tgme_widget_message_text').html();

        if (messageText) {
            // Split the content by <br> tags to handle each line separately
            const lines = messageText.split('<br>');

            const isPercentage = (value: string | undefined): boolean => {
                if (!value) return false;
                const regex = /^[+-]?\s*\d+(\.\d+)?%$/;
                return regex.test(value.trim());
            };

            // Process each line to extract relevant information
            let solCompleted = false;
            result = lines.map((line) => {
                if(solCompleted) return;
                const $line = cheerio.load(line);

                if($line('a').length < 1 || $line('a').length > 2) return;

                // Extract token name, market cap, and price change
                const tokenName = $line('a').length === 2 ? $line('a').first().text().trim() : $line('b').eq(1).text().trim();
                const telegram = $line('a').length === 2 ? $line('a').first().attr("href")?.trim() : "";
                const marketCap = $line('b').eq(3).text().replace(/MC/g, '').trim();
                const address = $line('a').last().attr("href")?.toString().slice(31, 82);
                const priceChange = $line('a').length === 2 ? $line('a').eq(1).text().trim().replace(/[\s+]+/g, '') : $line('a').first().text().trim().replace(/[\s+]+/g, '');

                if(priceChange === "TRONTRENDING") {
                    solCompleted = true;
                }

                if(tokenName.length > 0 && priceChange !== "SolTRENDING" && isPercentage(priceChange)) {
                    return {tokenName, marketCap: convertMarketCap(marketCap), priceChange: parseFloat(priceChange.replace(/[^\d.-]/g, '')), address, telegram};
                }
            }).filter(item => item !== undefined);
        }
    } catch (error: any) {
        const errorMessage = error?.cause?.code !== undefined ? error?.cause?.code : error;
        console.error(new Date(), 'Error fetching Telegram data:', errorMessage);
    }

    console.log(new Date(), "I: parser completed", source);

    if(result.length > 0) {
        try {
            const version = await getLatestVersion(source, NETWORK);
            await Promise.all(result.map(async (item, index) => {
                await trendingModel.insertOne({
                    createdAt: new Date(),
                    address: item.address,
                    extra: {
                        tokenName: item.tokenName,
                        marketCap: item.marketCap,
                        telegram: item?.telegram ? item?.telegram : ''
                    },
                    position: index+1,
                    network: NETWORK,
                    source,
                    version: version+1
                });
            }));

            console.log(new Date(), "I: parser DB OK", source, result.length, ((+new Date() - startTime)/1000).toFixed(2) + "s");
        } catch(e) {
            console.log(new Date(), "E: parser DB failed", source, e);
        }
    }
}