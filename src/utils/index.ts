import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
/**
 * @description: 处理表格数据，添加x,y,id等信息
 * @param tableData 表格数据
 * @param localRowCount 每一行有多少个元素
 * @returns 处理后的表格数据
 */
export function filterData(tableData: any[], localRowCount: number) {
    const dataLength = tableData.length
    let j = 0
    for (let i = 0; i < dataLength; i++) {
        if (i % localRowCount === 0) {
            j++
        }
        tableData[i].x = i % localRowCount + 1
        tableData[i].y = j
        // 保留原始的人员ID，不要覆盖
        // 如果已经有id（来自原始数据），则保留；否则使用索引作为临时id
        if (tableData[i].id === undefined || tableData[i].id === null) {
            tableData[i].id = tableData[i].cardIndex !== undefined ? tableData[i].cardIndex : i
        }
        // 是否中奖
    }

    return tableData
}

export function addOtherInfo(personList: any[], startOrderIndex: number = 0) {
    const len = personList.length
    const baseTime = new Date()
    for (let i = 0; i < len; i++) {
        // 确保移除 identity 字段（如果存在）
        delete personList[i].identity
        delete personList[i].Identity
        delete personList[i]['身份']
        // 确保移除 uid 字段（如果存在，因为显示时使用序号）
        delete personList[i].uid
        delete personList[i].UID
        delete personList[i]['编号']
        delete personList[i].number
        delete personList[i].Number
        delete personList[i].ID
        
        personList[i].id = uuidv4()
        // 为每个人员设置不同的 createTime，保持Excel中的顺序
        // 使用索引来创建递增的时间戳，确保排序时保持原始顺序
        const createTime = new Date(baseTime.getTime() + i)
        personList[i].createTime = dayjs(createTime).format('YYYY-MM-DD HH:mm:ss:ms')
        personList[i].updateTime = dayjs(createTime).format('YYYY-MM-DD HH:mm:ss:ms')
        // 添加 orderIndex 字段，用于稳定排序，保持Excel中的顺序
        // startOrderIndex 用于批量导入时保持顺序，单独添加时传入当前最大 orderIndex + 1
        personList[i].orderIndex = startOrderIndex + i
        personList[i].prizeName = [] as string[]
        personList[i].prizeTime = [] as string[]
        personList[i].prizeId = []
        personList[i].isWin = false
        personList[i].uuid = uuidv4()
    }

    return personList
}

export function selectCard(cardIndexArr: number[], tableLength: number, personId: number): number {
    // 使用加密安全的随机数生成器，确保公平性
    const randomBuffer = new Uint32Array(1)
    crypto.getRandomValues(randomBuffer)
    
    // 修复：使用 tableLength 而不是 tableLength - 1，确保所有卡牌都能被选中
    let cardIndex = randomBuffer[0] % tableLength
    
    // 如果选中的卡牌已经被选中，重新选择（最多尝试100次避免无限递归）
    let attempts = 0
    const maxAttempts = 100
    while (cardIndexArr.includes(cardIndex) && attempts < maxAttempts) {
        crypto.getRandomValues(randomBuffer)
        cardIndex = randomBuffer[0] % tableLength
        attempts++
    }
    
    // 如果达到最大尝试次数仍未找到，返回一个未使用的索引
    if (attempts >= maxAttempts) {
        // 找到第一个未使用的索引
        for (let i = 0; i < tableLength; i++) {
            if (!cardIndexArr.includes(i)) {
                return i
            }
        }
        // 如果所有卡牌都被选中了，返回随机索引
        return cardIndex
    }
    
    return cardIndex
}

export function themeChange(theme: string) {
    // 获取根html
    const html = document.querySelectorAll('html')
    if (html) {
        html[0].setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }
}
