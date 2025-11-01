const cron = require("node-cron");
const { SLALog } = require("../models/index");
const checkSlaBreach = require("../utils/sla_chacker");
const { Op } = require("sequelize");

// Cron job akan jalan tiap 5 menit
cron.schedule("*/1 * * * *", async () => {
  console.log(
    `[SLA CRON] Checking SLA breaches at ${new Date().toISOString()}`
  );

  const slaLogs = await SLALog.findAll({
    where: {
      [Op.or]: [
        { is_breached: false },
        { is_breached: null },
        { resolution_at: null },
      ],
      // atau: is_breached: false,
    },
  });

  for (const log of slaLogs) {
    await checkSlaBreach(log.ticket_id);
  }

  console.log(`[SLA CRON] Done checking ${slaLogs.length} tickets.`);
});
