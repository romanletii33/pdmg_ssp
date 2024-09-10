const Reader = require("@maxmind/geoip2-node").Reader
const path = require('path');
const config = require("../config/config")
const logger = require("../config/logger.config")
const createCsvWriter = require("csv-writer").createObjectCsvWriter
const nodemailer = require("nodemailer")
const ejs = require("ejs")

const dbPath = path.join(__dirname, config.openrtb.maxmind.db_city)

/**
 * Function to get geo location info with ip address from maxmind db
 * @param {string} ip 
 * @returns geo info | object
 */
const getGeoInfoWithIP = async (ip) => {
  try {
    const reader = await Reader.open(dbPath)
    const response = reader.city(ip);

    return response;

  } catch (err) {
    logger.error(`in getting geo info ${err.stack}`);
    throw err;
  }
}

/**
 * Function to generate GUID
 * @returns generated GUID | string
 */
const generateGUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Check if the GUID is valid or not
 * @param {string} id : GUID
 * @return true | false
 */
const isValidGUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);

/**
 * Function to replace macros into proper value
 * @param {string} data 
 * @param {string} values 
 * @returns replaced data | string
 */
const replaceMacros = async (data, values) => data.replace(/\$\{(\w+)\}/g, (_, macro) => values[macro] || '')

/**
 * Function to generate CSV file for daily and monthly report
 * @param {object} data 
 * @param {string} filePath 
 * @param {string} type : daily | monthly
 */
const generateCSV = async (data, filePath, type) => {
  try {
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: "publisher_id", title: "Publisher" },
        { id: "publisher_name", title: "Publisher Name" },
        { id: "date", title: type === "monthly" ? "Month" : "Date" },
        { id: "endpoint_id", title: "Endpoint" },
        { id: "total_bids", title: "Total bids" },
        { id: "total_requests", title: "Total requests" },
        { id: "total_wins", title: "Total wins" },
        { id: "total_win_price", title: "Total win price" },
        { id: "avg_win_price", title: "Avg win price" },
      ]
    })

    await csvWriter.writeRecords(data)

  } catch (err) {
    logger.error(`in generating csv file ${err.stack}`)
    throw err
  }
}

/**
 * Function to send email
 * @param {string} to 
 * @param {string} subject 
 * @param {object} data 
 * @param {string} type : monthly | daily
 * @param {string} attachmentPath 
 * @returns 
 */
const sendEmail = async (to, subject, data, type, attachmentPath) => {
  try {
    const transporter = nodemailer.createTransport(config.email.smtp)

    if (config.env !== 'test') {
      transporter
        .verify()
        .then(() => logger.info("Connected to email server"))
        .catch(() => logger.error("Unable to connect to email server. Make sure you have configured the SMTP options in .env"))
    }

    const html = await ejs.renderFile(
      path.join(__dirname, `../templates/${type}-report.ejs`),
      context = { data, rowspan: data.length },
      { async: true }
    )

    const mailOption = {
      from: config.email.from,
      to,
      subject,
      html,
      attachments: [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath
        }
      ]
    }

    return await transporter.sendMail(mailOption)

  } catch (err) {
    logger.error(`in sending email ${err.stack}`)
    throw err
  }
}

/**
 * Function to process report data 
 * @param {object} data 
 * @returns processed data | new object
 */
const processReportData = async (data) => {
  try {
    let processedData = []
    let dateCounts = {}

    // Count the number of entries for each date
    data.forEach(row => {
      if (!dateCounts[row.date]) {
        dateCounts[row.date] = 0
      }

      dateCounts[row.date]++
    });

    // Process the date and calculate rowspan
    data.forEach((row, index) => {
      if (index === 0 || row.date !== data[index - 1].date) {
        row.rowspan = dateCounts[row.date]

      } else {
        row.rowspan = 0
      }
      processedData.push(row)
    })

    return processedData

  } catch (err) {
    logger.error(`in processing report info: ${err.stack}`)
    throw err
  }
}

/**
 * Function to generate new security key
 * @param {number} length | optional | default: 32
 * @returns new security key | string
 */
const generateSecurityKey = async (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';

  for (let i = 0; i < length; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return key;
}

module.exports = {
  generateGUID,
  isValidGUID,
  getGeoInfoWithIP,
  replaceMacros,
  generateCSV,
  sendEmail,
  processReportData,
  generateSecurityKey
}
