const { exportDatabase } = require("../dist/getMappings");

(async () => {
    await exportDatabase().then(() => {
        console.log("Exported database.");
    })
})();