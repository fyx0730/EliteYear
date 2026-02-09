import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'

const data = readFileSync('public/人口登记表-170人.xlsx')
const wb = XLSX.read(data, {type: 'buffer'})
const ws = wb.Sheets[wb.SheetNames[0]]
const json = XLSX.utils.sheet_to_json(ws, {header: 1})

console.log('表头:', json[0])
console.log('\n前3行数据:')
json.slice(1, 4).forEach((row, i) => {
    console.log(`第${i + 1}行:`, row)
})
