import axios from 'axios'

const stockNo = ""; // 台積電
const date = ""; // 查詢日期 (YYYYMMDD)
const { data } = await axios.get('https://api.finmindtrade.com/api/v4/data', {
  params: {
    dataset: 'TaiwanStockInfo'
  }
})

// console.log('[testMarketApi] 全部股票資料:', data.data)
console.log('[testMarketApi] 資料筆數:', data.data.length)
console.log('[testMarketApi] 第一筆:', data.data[0])
console.log('[testMarketApi] 查 2330:', data.data.find((item) => item.stock_id === '2330'))
console.table(data.data.slice(0, 20)) //前20筆
data.data.forEach((item) => {
  console.log(item.stock_id, item.stock_name, item.industry_category)
})