import * as dotenv from "dotenv";

dotenv.config();
export const MONGO_CONNECTION = process.env.MONGO_CONNECTION as string;
export const MONGO_USER = process.env.MONGO_USER as string;
export const MONGO_PASS = process.env.MONGO_PASS as string;
export const TG_API_ID = process.env.TG_API_ID as string;
export const TG_API_HASH = process.env.TG_API_HASH as string;
export const TRENDING_SOURCES: any = {
    "trendguru": {
        "name": "Trend Guru",
        "source": "https://t.me/TrendGuru_SOL/4?embed=1",
        "original": "https://t.me/TrendGuru_SOL/4",
        "network": "SOL",
        "telegram": "https://t.me/TrendGuru_SOL",
        "frequency": 60, // seconds
    },
    "trendgurueth": {
        "name": "ETH Trend Guru",
        "source": "https://t.me/ETH_TrendGuru/9277?embed=1",
        "original": "https://t.me/ETH_TrendGuru/9277",
        "network": "ETH",
        "telegram": "https://t.me/ETH_TrendGuru",
        "frequency": 60, // seconds
    },
    "trendingeth": {
        "name": "Trending",
        "source": "https://t.me/trending/2?embed=1",
        "original": "https://t.me/trending/2",
        "network": "ETH",
        "telegram": "https://t.me/trending",
        "frequency": 60, // seconds
    },
    "trendingsol": {
        "name": "Trending",
        "source": "https://t.me/trending/16?embed=1",
        "original": "https://t.me/trending/16",
        "network": "SOL",
        "telegram": "https://t.me/trending",
        "frequency": 60, // seconds
    },
    "ethtrending": {
        "name": "ETHTRENDING",
        "source": "https://t.me/ETHTRENDING/8179026?embed=1",
        "original": "https://t.me/ETHTRENDING/8179026",
        "network": "ETH",
        "telegram": "https://t.me/ETHTRENDING",
        "frequency": 60, // seconds
    },
    "cherrytrendingsol": {
        "name": "Cherry Trading",
        "source": "https://t.me/cherrytrending/8?embed=1",
        "original": "https://t.me/cherrytrending/8",
        "network": "SOL",
        "telegram": "https://t.me/cherrytrending/",
        "frequency": 60, // seconds
    },
    "cherrytrendingtron": {
        "name": "Cherry Trading",
        "source": "https://t.me/cherrytrending/8?embed=1",
        "original": "https://t.me/cherrytrending/8",
        "network": "TRON",
        "telegram": "https://t.me/cherrytrending/",
        "frequency": 60, // seconds
    },
    "cherrytrendingeth": {
        "name": "Cherry Trading",
        "source": "https://t.me/cherrytrending/14?embed=1",
        "original": "https://t.me/cherrytrending/14",
        "network": "ETH",
        "telegram": "https://t.me/cherrytrending/",
        "frequency": 60, // seconds
    },
    "cherrytrendingbase": {
        "name": "Cherry Trading",
        "source": "https://t.me/cherrytrending/14?embed=1",
        "original": "https://t.me/cherrytrending/14",
        "network": "BASE",
        "telegram": "https://t.me/cherrytrending/",
        "frequency": 60, // seconds
    },
    "cherrytrendingbsc": {
        "name": "Cherry Trading",
        "source": "https://t.me/cherrytrending/14?embed=1",
        "original": "https://t.me/cherrytrending/14",
        "network": "BSC",
        "telegram": "https://t.me/cherrytrending/",
        "frequency": 60, // seconds
    },
    "trendingssol": {
        "name": "SOL Trending",
        "source": "https://t.me/trendingssol/4939452?embed=1",
        "original": "https://t.me/trendingssol/4939452",
        "network": "SOL",
        "telegram": "https://t.me/trendingssol",
        "frequency": 60, // seconds
    },
    "spydefitron": {
        "name": "SpyDefi Trending",
        "source": "https://t.me/spydefi/12?embed=1",
        "original": "https://t.me/spydefi/12",
        "network": "TRON",
        "telegram": "https://t.me/spydefi",
        "frequency": 60, // seconds
    },
    "spydefisol": {
        "name": "SpyDefi Trending",
        "source": "https://t.me/spydefi/12?embed=1",
        "original": "https://t.me/spydefi/12",
        "network": "SOL",
        "telegram": "https://t.me/spydefi",
        "frequency": 60, // seconds
    },
    "spydefieth": {
        "name": "SpyDefi Trending",
        "source": "https://t.me/spydefi/12?embed=1",
        "original": "https://t.me/spydefi/12",
        "network": "ETH",
        "telegram": "https://t.me/spydefi",
        "frequency": 60, // seconds
    },
    "spydefibsc": {
        "name": "SpyDefi Trending",
        "source": "https://t.me/spydefi/12?embed=1",
        "original": "https://t.me/spydefi/12",
        "network": "BSC",
        "telegram": "https://t.me/spydefi",
        "frequency": 60, // seconds
    },
    "findertrending": {
        "name": "Finder Trending",
        "source": "https://t.me/findertrending/8?embed=1",
        "original": "https://t.me/findertrending/8",
        "network": "SOL",
        "telegram": "https://t.me/findertrending",
        "frequency": 60, // seconds
    },
    "basetrending": {
        "name": "BASE TRENDING (LIVE)",
        "source": "https://t.me/BASETRENDINGLIVE/2765891?embed=1",
        "original": "https://t.me/BASETRENDINGLIVE/2765891",
        "network": "BASE",
        "telegram": "https://t.me/BASETRENDINGLIVE",
        "frequency": 60, // seconds
    },
    "soltrending": {
        "name": "SOL TRENDING",
        "source": "https://t.me/SOLTRENDING/4221757?embed=1",
        "original": "https://t.me/SOLTRENDING/4221757",
        "network": "SOL",
        "telegram": "https://t.me/SOLTRENDING",
        "frequency": 60, // seconds,
    },
    "moontrendingeth": {
        "name": "MoonTrending ETH",
        "source": "https://t.me/trendingcrypto/87?embed=1",
        "original": "https://t.me/trendingcrypto/87",
        "network": "ETH",
        "telegram": "https://t.me/trendingcrypto/",
        "frequency": 60, // seconds,
    },
    "moontrendingsol": {
        "name": "MoonTrending SOL",
        "source": "https://t.me/trendingcrypto/87?embed=1",
        "original": "https://t.me/trendingcrypto/87",
        "network": "SOL",
        "telegram": "https://t.me/trendingcrypto/",
        "frequency": 60, // seconds,
    },
    "moontrendingtron": {
        "name": "MoonTrending TRON",
        "source": "https://t.me/trendingcrypto/87?embed=1",
        "original": "https://t.me/trendingcrypto/87",
        "network": "TRON",
        "telegram": "https://t.me/trendingcrypto/",
        "frequency": 60, // seconds,
    },
    "moontrendingbase": {
        "name": "MoonTrending BASE",
        "source": "https://t.me/trendingcrypto/87?embed=1",
        "original": "https://t.me/trendingcrypto/87",
        "network": "BASE",
        "telegram": "https://t.me/trendingcrypto/",
        "frequency": 60, // seconds,
    },
    "moontrendingbsc": {
        "name": "MoonTrending BSC",
        "source": "https://t.me/trendingcrypto/87?embed=1",
        "original": "https://t.me/trendingcrypto/87",
        "network": "BSC",
        "telegram": "https://t.me/trendingcrypto/",
        "frequency": 60, // seconds,
    },
}
export const MOONTOK_COOKIES = "cf_clearance=Tek1keuyESDElEYPBEMJGUwMff7zWvcWFs.EtL2TJS8-1733404936-1.2.1.1-LO3vBU6HllbMfmhoTvsIgXYTVoV3dMQS.f8qPtF6ST9uHi8aN6y40xHLS.6VxmjRAJ.60Vz.6g7CxK9TnCyh09xpfm2Kq0E_yIP81hj03dFoOE5B_3tcpT9v7rEC7rnTeBcjeKQaTYTrSBNS1YHw4DlO83iVKpg4jD4NL062QfpFN6QQXXPSRcAZPEgdaHNhPRjjWBy3imO8nMhMXqi665Vyh8wBlMebRT7IQlrsAxt3HYxmdLYRi9JSvI.Kk0k4hVttcTY2mai7LNKesVq5jGLstGy5v5WawflzSs5SomXa6Jv3EdrzqzUgcFkeCGCJ953jf5JrqYuZwgCLlJ4.fH_iOoCpwiGUrW_uQwK2fB6EBf5cMcjCZUkcXe8BpUsE; __Secure-next-auth.callback-url=https%3A%2F%2Fmoontok.io; __Host-next-auth.csrf-token=8eb6ad43adbceba27d90a5690317ad084001b7dc546617761538704c4e4c82eb%7Cf807ed74d1bf52c0396139a5e80e92ac26418b4d5849cc9c5d46cde5b9e12bd0"
/*
    https://t.me/bnbtrendingcherry/3 protected
    https://t.me/trendingontron no list
*/