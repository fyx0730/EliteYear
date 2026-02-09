import * as XLSX from 'xlsx'
import { addOtherInfo } from '@/utils'
// 定义消息类型
interface WorkerMessage {
    type: 'start' | 'stop' | 'reset'
    data: any
    templateData: any
}

let allData: any[] = []

function headersEqual(template: string[], actual: string[]): boolean {
    return template.length >= actual.length
      && actual.some(item => template.includes(item))
}
// 接收主线程消息
globalThis.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    switch (e.data.type) {
        case 'start':
        {
            const fileData = e.data.data
            const templateData = e.data.templateData

            const workBook = XLSX.read(fileData, { type: 'binary', cellDates: true })
            const workSheet = workBook.Sheets[workBook.SheetNames[0]]
            const excelData: object[] = XLSX.utils.sheet_to_json(workSheet)

            const templateWorkBook = XLSX.read(templateData, { type: 'array', cellDates: true })
            const templateWorkSheet = templateWorkBook.Sheets[templateWorkBook.SheetNames[0]]
            const templateExcelData: object[] = XLSX.utils.sheet_to_json(templateWorkSheet)

            const templateHeader = Object.keys(templateExcelData[0])
            const header = Object.keys(excelData[0])

            if (!headersEqual(templateHeader, header)) {
                globalThis.postMessage({
                    type: 'error',
                    data: null,
                    message: 'not right template',
                })
                return
            }
            // 处理导入数据：移除 identity 字段和 uid 字段（因为显示时使用序号）
            const processedData = excelData.map((item: any) => {
                const newItem: any = { ...item }
                // 移除 identity 字段（可能是英文或中文）
                delete newItem.identity
                delete newItem.Identity
                delete newItem['身份']
                // 移除 uid 字段（可能是英文或中文翻译）
                delete newItem.uid
                delete newItem.UID
                delete newItem['编号']
                delete newItem.number
                delete newItem.Number
                delete newItem.ID
                return newItem
            })
            allData = addOtherInfo(processedData)
            globalThis.postMessage({
                type: 'done',
                data: allData,
                message: '读取完成',
            })
            break
        }
        default:
            globalThis.postMessage({
                type: 'fail',
                data: null,
                message: '读取失败',
            })
            break
    }
}
