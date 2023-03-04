const { clearDatabase } = require("../dist/getMappings");

(async () => {
    await clearDatabase().then(() => {
        console.log("Cleared database.");
    })
})();