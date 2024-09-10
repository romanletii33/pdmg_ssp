const reportCrons = require("./report.cron")

async function start() {
  reportCrons.dailyReportCrons.start()
  reportCrons.monthlyReportCrons.start()
}

module.exports = { start } 