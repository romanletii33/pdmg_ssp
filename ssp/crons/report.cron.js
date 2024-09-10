const cron = require("node-cron")
const { reportService } = require("../services")

const dailyReportCrons = cron.schedule('0 1 * * *', async () => {
  await reportService.generateAndSendReports("Daily report", "daily")
}) // Schedule daily report at 1:00 AM every day

const monthlyReportCrons = cron.schedule('0 1 1 * *', async () => {
  await reportService.generateAndSendReports("Monthly report", "monthly")
}) // Schedule monthly report at 1:00 AM first day of every month

module.exports = {
  dailyReportCrons,
  monthlyReportCrons
}