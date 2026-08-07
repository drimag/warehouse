const cron = require("node-cron");
const { runArchive } = require("./services/archiveService");

const startArchiveCron = () => {
  cron.schedule("0 2 * * 0", async () => {
    console.log("🗂️  [CRON] Starting scheduled archive — Sunday 2AM");
    try {
      const result = await runArchive("system");
      if (result.skipped) {
        console.log("🗂️  [CRON] Archive skipped:", result.message);
      } else {
        console.log(`🗂️  [CRON] Archive complete. ${result.waybillCount} waybill(s) → ${result.fileName}`);
      }
    } catch (err) {
      console.error("❌ [CRON] Archive job failed:", err.message);
    }
  });

  console.log("✅ Archive cron scheduled (Sundays at 2AM)");
};

module.exports = { startArchiveCron };
