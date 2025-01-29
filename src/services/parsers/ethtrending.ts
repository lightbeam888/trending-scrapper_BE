import axios from 'axios';
import * as cheerio from 'cheerio';
import {convertMarketCap} from "../shared";
import {getLatestVersion, trendingModel} from "../../models/trending";

const NETWORK = "ETH";

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
            result = lines.map((line) => {
                const $line = cheerio.load(line);

                // Extract token name, market cap, and price change
                const tokenName = $line('a').first().text().trim();
                const tokenTelegram = $line('a').first().attr("href")?.toString();
                const marketCap = $line.html()?.split('|')[1]?.trim();
                const address = $line('a').last().attr("href")?.toString().slice(40, 82);
                const priceChange = $line('a').last().text().trim();

                if(tokenName.length > 0 && tokenName !== "@buytech" && tokenName !== "@ETHTRENDING") {
                    return {
                        tokenName,
                        marketCap: convertMarketCap(marketCap),
                        priceChange: parseFloat(priceChange.replace(/[^\d.-]/g, '')),
                        address,
                        telegram: tokenTelegram
                    };
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