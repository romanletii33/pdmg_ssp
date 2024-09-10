const SSPEngine = require('./index')
const logger = require("./config/logger.config")
const config = require("./config/config")
const crons = require("./crons")
const { DB_HANDLE } = require('./model')
const fs = require('fs')
const path = require('path')

// Connecting to DB
DB_HANDLE.connect((err) => {
    if (err) {
        logger.error(`Failed in connecting to DB ${err.stack}`)
        process.exit()
    } else {
        logger.info('Connected to DB')

        runServer() // Call runServer after DB connection

        crons.start().then(() => {
            logger.info("Crons started")
        }) // Start schedule for daily or monthly report
    }
})

const runServer = () => {
    const engine = new SSPEngine({ healthCheck: '/healthCheck' })
    engine.listen(config.port || 8080)
}

const reports_folder_path = path.join(__dirname, '/reports')
const monthly_reports_folder_path = path.join(reports_folder_path, '/monthly')
const daily_folder_path = path.join(reports_folder_path, '/daily')
const temp_folder_path = path.join(__dirname, '/tmp')
if (!fs.existsSync(reports_folder_path)) fs.mkdirSync(reports_folder_path)
if (!fs.existsSync(monthly_reports_folder_path)) fs.mkdirSync(monthly_reports_folder_path)
if (!fs.existsSync(daily_folder_path)) fs.mkdirSync(daily_folder_path)
if (!fs.existsSync(temp_folder_path)) fs.mkdirSync(temp_folder_path)

module.exports = { runServer }