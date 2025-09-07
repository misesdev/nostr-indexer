import cron from "node-cron";
import runIndexer from ".";

// Executa todo dia às 00:00
cron.schedule("0 0 * * *", async () => {
    console.log("Executando indexador às 00:00...");
    await runIndexer()
});

