import axios from 'axios';
import * as cheerio from 'cheerio';
import {convertMarketCap, fetchDataWithPython} from "../shared";
import {getLatestVersion, trendingModel} from "../../models/trending";
import NodeCache from "node-cache";
import {MOONTOK_COOKIES} from "../../constants";

const NETWORK = "BSC";

const MOON_CACHE = new NodeCache({stdTTL: 120*9999, checkperiod: 120*9999})

async function fetchPageProps(url: string | undefined) {
    if(url === undefined) {
        return null;
    }

    try {
        if(MOON_CACHE.get(url)) {
            return MOON_CACHE.get(url);
        }
        // Load the URL
        // const response = await axios.get(url, {
        //     headers: {
        //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        //         'Referer': 'https://moontok.io/',
        //         'Accept-Language': 'en-US,en;q=0.9',
        //         'Accept-Encoding': 'gzip, deflate, br',
        //         'Cookie': MOONTOK_COOKIES
        //     }
        // });

        const response = await fetchDataWithPython(url);

        // Parse the HTML using cheerio
        const $ = cheerio.load(response);

        // Find the <script> tag with id="__NEXT_DATA__"
        const scriptTagContent = $('#__NEXT_DATA__').html();

        if (scriptTagContent) {
            // Parse the JSON content inside the script tag
            const nextData = JSON.parse(scriptTagContent);

            // Access the props.pageProps field
            const address: any = nextData.props?.pageProps?.coin?.chains[0]?.contract_address;

            MOON_CACHE.set(url, address);

            return address;
        } else {
            console.log('Script tag not found');
        }
    } catch (error) {
        console.error('Error fetching the page:', error);
    }

    return null;
}

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
            for await (const line of lines) {
                const $line = cheerio.load(line);
                const linePlain = $line.text().trim();

                if(linePlain.indexOf("BSC - Trending") >= 0) {
                    aCompleted = false;
                }

                if(linePlain.indexOf("ALT - Trending") >= 0) {
                    bCompleted = true;
                }

                if(aCompleted) continue;
                if(bCompleted) break;

                if($line('a').length > 3) continue;

                // Extract token name, market cap, and price change
                let tokenName = $line('a').length === 2 ? $line('a').first().text().trim() : $line.html()?.split('|')[0]?.trim().replace(/<i\b[^>]*>(.*?)<\/i>/gi, '').replace(/<[^>]*>/g, '').trim();
                tokenName = tokenName.indexOf("%") >= 0 ? tokenName.slice(tokenName.indexOf("%")+2) : tokenName;
                const telegram = $line('a').first().attr("href")?.trim();
                const marketCap = $line('a').eq(1).text().trim().replace(/\$/g, '').trim();
                const addressSource: string | undefined = $line('a').eq(1).attr("href")?.toString();
                //console.log("fetching...", addressSource);
                const address = addressSource ? await fetchPageProps(addressSource) : "";
                //console.log("fetched", address);

                if(tokenName.length > 0 && tokenName.indexOf("BSC - Trending") < 0) {
                    result.push({tokenName, marketCap: convertMarketCap(marketCap), priceChange: 0, address, telegram});
                }
            }

            result.filter(item => item !== undefined);
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