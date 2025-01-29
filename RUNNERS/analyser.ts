import {mongoClient} from "../src/services/db/client";
import {runIntervals} from "../src/services/shared";

mongoClient.once('open', async () => {
    try {
        console.log('Connected to mongo.');

        await runIntervals();
    } catch(e) {
        console.log("E:", e);
    }
});