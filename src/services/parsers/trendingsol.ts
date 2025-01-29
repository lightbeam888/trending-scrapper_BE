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
        const {data} = await axios.get(settings.source, {timeout: 10000});

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

                const emojiTags = $line('tg-emoji');

                // Check if there are at least two <tg-emoji> tags
                let firstEmojiText: any;
                if (emojiTags.length >= 2) {
                    // Extract text between the first two <tg-emoji> tags
                    //firstEmojiText = emojiTags.eq(0).nextUntil(emojiTags.eq(1));//.text().trim();
                    //let firstEmojiText = '';
                    // Get the nodes between the first and second <tg-emoji> tags
                    let currentNode: any = emojiTags.eq(0).next();

                    while (currentNode.length && !currentNode.is(emojiTags.eq(1))) {
                      // Append text content of each node
                      if (currentNode[0].type === 'text' && currentNode.text() !== undefined) {
                        firstEmojiText = currentNode.text();
                      } else if (currentNode[0].type === 'tag' && currentNode.text() !== undefined) {
                        // For elements, get the text content recursively
                        firstEmojiText = currentNode.text();
                      }
                      currentNode = currentNode.next();
                    }
                } else {
                    return;
                }

                if(firstEmojiText === undefined) {
                    // @ts-ignore
                    firstEmojiText = emojiTags.eq(0).next()[0].prev?.data;
                }

                // Extract token name, market cap, and price change
                const tokenName = firstEmojiText.trim();
                const marketCap = $line('a').last().text().trim();
                const address = $line('a').last().attr("href")?.toString().slice(33);
                //console.log("pre", firstEmojiText/*, firstEmojiText.text(), firstEmojiText.attr("href")*/);
                if (tokenName.length > 0 && tokenName.indexOf("@SOLTRENDING") === -1 && tokenName.indexOf("SOL Trending") === -1) {
                    return {
                        tokenName,
                        marketCap: convertMarketCap(marketCap),
                        address
                    };
                }
            }).filter(item => item !== undefined);
        }
    } catch (error: any) {
        const errorMessage = error?.cause?.code !== undefined ? error?.cause?.code : error;
        console.error(new Date(), 'Error fetching Telegram data:', errorMessage);
    }

    console.log(new Date(), "I: parser completed", source);

    if (result.length > 0) {
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
                    position: index + 1,
                    network: NETWORK,
                    source,
                    version: version + 1
                });
            }));

            console.log(new Date(), "I: parser DB OK", source, result.length, ((+new Date() - startTime)/1000).toFixed(2) + "s");
        } catch (e) {
            console.log(new Date(), "E: parser DB failed", source, e);
        }
    }
}