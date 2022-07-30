require('dotenv').config()
const app = require('express')()
const port = process.env.PORT || 5000
const axios = require('axios')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const {
  ACCESS_TOKEN,
  SHOPIFY_URL,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_URL,
} = process.env

app.get('/', async (_: any, res: any) => {
  try {
    // Getting information from Shopify
    const { data } = await axios({
      url: `${SHOPIFY_URL}/admin/api/2022-07/orders.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
    })
    // Accessing spreadsheet and modifying it
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID)
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    })
    await doc.loadInfo()
    const worksheet = doc.sheetsByIndex[0]
    await worksheet.clear()
    await worksheet.setHeaderRow([
      'id',
      'browser_ip',
      'current_subtotal_price',
      'email',
      'gateway',
      'order_number',
    ])
    await worksheet.addRows(data.orders)
    res.send(`<a href='${SPREADSHEET_URL}'>Updated Spreadsheet</a>`)
  } catch (error: any) {
    res.send('Something went wrong!')
    console.log(error?.message)
  }
})

app.listen(port, () => console.log(`Server running on port ${port}`))
