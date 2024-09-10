const { DB_query } = require("../model")
const logger = require('../config/logger.config')

const addDeal = async (fields) => {
  try {
    const query = `INSERT INTO publisher_deals SET ${fields.join(', ')}`
    const result = await DB_query(query)

    return result

  } catch (err) {
    logger.error(`in adding publisher deal ${err.stack}`)
    throw new Error('Adding publisher deal failed')
  }
}

const updateDeal = async (fields, publisherId, dealId) => {
  try {
    let query
    if (!dealId) {
      query = `UPDATE publisher_deals SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}'`;

    } else {
      query = `UPDATE publisher_deals SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}' and deal_id = '${dealId}'`;
    }

    return await DB_query(query)

  } catch (err) {
    logger.error(`in updating publisher deal ${err.stack}`)
    throw new Error('Updating publisher deal failed')
  }
}

const deleteDeal = async (id) => {
  if (!id) throw new Error('Bad request')

  try {
    const query = `DELETE from publisher_deals WHERE id = '${id}'`

    return await DB_query(query)

  } catch (err) {
    logger.error(`in deleting a deal ${err. stack}`)
    throw new Error('Deleting publisher deal failed')
  }
}

const getDeal = async (publisherId, dealId) => {
  try {
    const query = `SELECT * FROM publisher_deals where publisher_id = '${publisherId}' and deal_id = '${dealId}' and ISNULL(deleted_at)`

    return await DB_query(query)

  } catch (err) {
    logger.error(`in getting endpoint with publisher and endpoint id ${err.stack}`)
    throw new Error("Error in getting endpoint with publisher and endpoint id")
  }
}

const countTotalDeals = async (publisherId) => {
  try {
    const query = `SELECT COUNT(id) as total_count from publisher_deals where publisher_id = '${publisherId}' and ISNULL(deleted_at)`

    return await DB_query(query)

  } catch (err) {
    logger.error(`in counting total endpoints ${err.stack}`)
    throw err
  }
}

const getDealList = async (publisherId, start, limit) => {
  try {
    query = `SELECT * FROM publisher_deals where publisher_id = '${publisherId}' and ISNULL(deleted_at) LIMIT ${limit} OFFSET ${start}`

    return await DB_query(query)

  } catch (err) {
    logger.error(`in getting publisher deals ${err.stack}`)
    throw new Error('Getting publisher deals failed')
  }
}

const getDealsByPublisherId = async (id) => {
  try {
    const query = `SELECT * FROM publisher_deals where publisher_id = '${id}' and ISNULL(deleted_at)`

    return await DB_query(query)

  } catch (err) {
    logger.error(`in getting publisher deals by publisher id ${err.stack}`)
    throw new Error("Error in getting publisher deals by publisher id")
  }
}

module.exports = {
  addDeal,
  updateDeal,
  deleteDeal,
  getDeal,
  countTotalDeals,
  getDealList,
  getDealsByPublisherId
}