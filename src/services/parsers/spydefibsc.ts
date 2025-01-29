import axios from 'axios';
import * as cheerio from 'cheerio';
import {convertMarketCap} from "../shared";
import {getLatestVersion, trendingModel} from "../../models/trending";

const NETWORK = "BSC";

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
            let aCompleted = true;
            let bCompleted = false;
            result = lines.map((line) => {
                const $line = cheerio.load(line);
                const linePlain = $line.text().trim();

                if(linePlain.indexOf("BSC Trending") >= 0) {
                    aCompleted = false;
                }

                if(linePlain.indexOf("Arrows") >= 0) {
                    bCompleted = true;
                }

                if(aCompleted) return;
                if(bCompleted) return;

                if($line('a').length < 4) return;

                // Extract token name, market cap, and price change
                const tokenName = $line('a').first().text().trim();
                const telegram = $line('a').first().attr("href")?.trim();
                const marketCap = $line('a').eq(1).text().trim().replace(/\$/g, '').trim();
                const address = $line('a').eq(1).attr("href")?.toString().slice(28, 82);

                if(tokenName.length > 0) {
                    return {tokenName, marketCap: convertMarketCap(marketCap), priceChange: 0, address, telegram};
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