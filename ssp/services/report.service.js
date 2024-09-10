const logger = require("../config/logger.config")
const { publisherService, winService } = require(".")
const path = require("path")
const moment = require("moment")
const { DB_query } = require("../model")
const { generateCSV, sendEmail, processReportData } = require("../libs/methods")
const fs = require("fs")
const httpStatus = require("http-status")

const generateAndSendReports = async (subject, type) => {
  try {
    const publishers = await publisherService.getAvailablePublishers()
    if (!publishers || !publishers.length) return

    for (const publisher of publishers) {
      if (!publisher.contact_email) continue

      let reportInfo = await winService.getReportInfo(publisher.publisher_id, type)

      if (!reportInfo || !reportInfo.length) continue
      reportInfo = await processReportData(reportInfo) // Process report data into formatted data to display to html
      const curDate = moment().format("YYYY-MM-DD")
      const filePath = type === "monthly"
        ? path.join(__dirname, `../reports/monthly/monthly_report_${curDate}.csv`)
        : path.join(__dirname, `../reports/daily/daily_report_${curDate}.csv`)

      await generateCSV(reportInfo, filePath, type) // Generate csv file for report

      reportInfo.push({ date: curDate })
      const info = await sendEmail(
        publisher.contact_email,
        subject,
        reportInfo,
        type,
        filePath
      ) // Send report as an email
      if (!info) {
        logger.warn(`Email didn't send`)
      } else {
        logger.info(`Email sent successfully to ${info.envelope.to}`)
      }

      fs.unlinkSync(filePath) // Clean up the file after sending the email
    }

  } catch (err) {
    throw err
  }
}

const sendReportToPublisher = async (publisherId, endpointId = null) => {
  try {
    let publisher = await publisherService.getPublisherById(publisherId)

    if (!publisher || !publisher.length) {
      return {
        code: httpStatus.NOT_FOUND,
        message: 'Not activated publisher'
      }
    }
    publisher = publisher[0]
    if (!publisher.contact_email) {
      return {
        code: httpStatus.NOT_FOUND,
        message: "No contact email in the publisher"
      }
    }

    let reportInfo = await winService.getAllReportInfoForPublisher(publisher.publisher_id, endpointId)

    if (!reportInfo || !reportInfo.length) {
      return {
        code: httpStatus.NOT_FOUND,
        message: "No report information"
      }
    }
    reportInfo = await processReportData(reportInfo) // Process report data into formatted data to display to html
    const curDate = moment().format("YYYY-MM-DD")
    const filePath = path.join(__dirname, `../reports/${curDate}.csv`)

    await generateCSV(reportInfo, filePath, type='general') // Generate csv file for report

    reportInfo.push({ date: curDate })
    const info = await sendEmail(
      publisher.contact_email,
      'Report',
      reportInfo,
      type = 'general',
      filePath
    ) // Send report as an email
    if (!info) {
      logger.warn(`Email didn't send`)
    } else {
      logger.info(`Email sent successfully to ${info.envelope.to}`)
    }

    fs.unlinkSync(filePath) // Clean up the file after sending the email

    return {
      code: httpStatus.OK,
      message: 'Successfully reported to the publisher'
    }
  } catch (err) {
    throw err
  }
}

const updateConsolidatedWins = async (fields, publisherId) => {
  if (!fields || !fields.length || !publisherId) throw new Error('bad request')

  try {
    const query = `UPDATE reporting_consolidated_wins SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}'`;

    return await DB_query(query)

  } catch (err) {
    logger.error(`in updating publisher ${err.stack}`)
    throw new Error('Updating publisher failed')
  }
}

module.exports = {
  generateAndSendReports,
  updateConsolidatedWins,
  sendReportToPublisher
}