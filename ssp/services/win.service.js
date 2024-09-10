const { DB_query } = require("../model")
const logger = require('../config/logger.config')
const moment = require("moment")

/**
 * Function to save winner of every auction
 * @param {object} winInfo
 * @returns
 */
const saveWinInfo = async (winInfo) => {
  try {
    let dealid = winInfo.winnerBid.dealid && winInfo.winnerBid.dealid || ''
    let clickUrl = winInfo.winnerBid.curl && winInfo.winnerBid.curl || ''
    let query = `INSERT INTO reporting_wins 
    SET publisher_id = '${winInfo.publisherId}',
    impression_id = '${winInfo.impId}',
    creative_url = '${winInfo.winnerBid.adm}',
    click_url = '${clickUrl}',
    deal_id = '${dealid}',
    orig_bid_price = ${winInfo.winnerBid.price},
    win_bid_price = ${winInfo.winnerBid.winPrice},
    device_id = '${winInfo.deviceId}',
    ip_origin_request = '${winInfo.ipAddress}',
    userage_request = '${winInfo.ua}',
    publisher_endpoint_id = '${winInfo.winnerBid.endpointId}',
    created_at = ${moment().unix()},
    updated_at = ${moment().unix()}
    `

    return await DB_query(query)

  } catch (err) {
    logger.error(`in saving winner info ${err.stack}`)
    throw err
  }
}

/**
 * Function to save report info to the reporting_consolidated_wins table
 * @param {object} reportInfo 
 */
const saveReportInfo = async (reportInfo) => {
  try {
    const { publisherId, publisherName, totalBids, totalWins, totalRequests, endpointId, winPrice } = reportInfo

    const query = `
      INSERT 
        INTO reporting_consolidated_wins
        SET 
          publisher_id = '${publisherId}',
          publisher_name = '${publisherName}',
          total_bids = ${totalBids},
          total_requests = ${totalRequests},
          total_wins = ${totalWins},
          total_win_price = ${winPrice},
          consolidated_date = CURDATE(),
          publisher_endpoint_id = '${endpointId}'
          `

    return await DB_query(query)

  } catch (err) {
    logger.error(`in saving report info ${err.stack}`)
    throw err
  }
}

/**
 * Function to get report info for daily or monthly report
 * @param {string} publisherId 
 * @param {string} type monthly or daily
 * @returns report info | array
 */
const getReportInfo = async (publisherId, type) => {
  try {
    const query = type === "monthly"
      ? `SELECT
            publisher_id,
            publisher_endpoint_id as endpoint_id,
            publisher_name,
            SUM(total_bids) as total_bids, 
            SUM(total_wins) as total_wins, 
            SUM(total_win_price) as total_win_price, 
            SUM(total_requests) as total_requests,
            consolidated_date as date
        FROM reporting_consolidated_wins
        WHERE 
            publisher_id = '${publisherId}'
            AND consolidated_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
            AND consolidated_date < DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND ISNULL(deleted_at)
        GROUP BY publisher_endpoint_id`
      : `SELECT 
            publisher_id,
            publisher_name,
						publisher_endpoint_id as endpoint_id,
            SUM(total_bids) as total_bids, 
            SUM(total_wins) as total_wins, 
            SUM(total_win_price) as total_win_price, 
            consolidated_date as date, 
            SUM(total_requests) as total_requests
         FROM reporting_consolidated_wins
         WHERE
            publisher_id = '${publisherId}'
            AND consolidated_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
			      AND consolidated_date < CURDATE()
            AND ISNULL(deleted_at)
         GROUP BY consolidated_date, publisher_endpoint_id`

    const rows = await DB_query(query)
    if (!rows || !rows.length) return rows

    rows.map(row => {
      row.avg_win_price = 0
      if (row.date) {
        row.date = type === "monthly" ? moment(row.date).format("YYYY-MM") : moment(row.date).format("YYYY-MM-DD")
      }
      if (row.total_win_price && row.total_wins) {
        row.avg_win_price = (row.total_win_price / row.total_wins).toFixed(5)
      }
    })

    return rows

  } catch (err) {
    logger.error(`in getting report info ${err.stack}`)
    throw err
  }
}

/**
 * Function to get all report info for specific publisher
 * @param {*} publisherId 
 * @param {*} endpointId 
 */
const getAllReportInfoForPublisher = async (publisherId, endpointId = null) => {
  try {
    const query = endpointId
      ? `SELECT
        publisher_id,
        publisher_endpoint_id as endpoint_id,
        publisher_name,
        SUM(total_bids) as total_bids, 
        SUM(total_wins) as total_wins, 
        SUM(total_win_price) as total_win_price, 
        SUM(total_requests) as total_requests,
        consolidated_date as date
     FROM reporting_consolidated_wins
     WHERE 
        publisher_id = '${publisherId}'
        AND publisher_endpoint_id = '${endpointId}'
        AND ISNULL(deleted_at)
     GROUP BY consolidated_date`
      : `SELECT 
        publisher_id,
        publisher_name,
        publisher_endpoint_id as endpoint_id,
        SUM(total_bids) as total_bids, 
        SUM(total_wins) as total_wins, 
        SUM(total_win_price) as total_win_price, 
        consolidated_date as date, 
        SUM(total_requests) as total_requests,
        consolidated_date as date
     FROM reporting_consolidated_wins
     WHERE
        publisher_id = '${publisherId}'
        AND ISNULL(deleted_at)
     GROUP BY consolidated_date, publisher_endpoint_id`

    const rows = await DB_query(query)
    if (!rows || !rows.length) return rows

    rows.map(row => {
      row.avg_win_price = 0
      if (row.date) {
        row.date = moment(row.date).format("YYYY-MM-DD")
      }
      if (row.total_win_price && row.total_wins) {
        row.avg_win_price = (row.total_win_price / row.total_wins).toFixed(5)
      }
    })

    return rows
    
  } catch (err) {
    logger.error(`in getting all report info for a publisher ${err.stack}`)
    throw err
  }
}

const updateReportingWins = async (fields, publisherId) => {
  try {
    const query = `UPDATE reporting_wins SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}'`;

    return await DB_query(query)

  } catch (err) {
    logger.error(`in updating publisher ${err.stack}`)
    throw new Error('Updating publisher failed')
  }
}

module.exports = {
  saveWinInfo,
  saveReportInfo,
  getReportInfo,
  getAllReportInfoForPublisher,
  updateReportingWins
}
