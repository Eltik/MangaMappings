const { crawl } = require("../dist/crawl");

(async () => {
    await crawl().then(() => {
        console.log("Finished crawling.");
    })
})();