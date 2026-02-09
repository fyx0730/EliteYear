import type { IPersonConfig } from '@/types/storeType'
import confetti from 'canvas-confetti'
import { Object3D, Vector3 } from 'three'
import { filterData } from '@/utils'
/**
 * @description 初始化表格数据
 * @param0 allPersonList 所有人的列表
 * @param1 rowCount 行数，默认是7行
 * @returns 表格数据
 */
export function initTableData({ allPersonList, rowCount }: { allPersonList: IPersonConfig[], rowCount: number }): IPersonConfig[] {
    let tableData: IPersonConfig[] = []
    if (allPersonList.length <= 0) {
        return []
    }
    const totalCount = rowCount * 7
    const allPersonLength = allPersonList.length
    
    if (allPersonLength < totalCount) {
        // 如果人员数量少于卡牌数量，使用循环填充，但确保每个人员只出现一次
        // 使用取模运算循环使用人员，避免重复显示同一人员
        const copiedList = allPersonList.map((person, index) => ({
            ...JSON.parse(JSON.stringify(person)),
            originalIndex: index
        }))
        
        // 循环填充，确保每个人员按顺序出现，不重复
        tableData = Array.from({ length: totalCount }, (_, i) => {
            const personIndex = i % allPersonLength
            return {
                ...JSON.parse(JSON.stringify(copiedList[personIndex])),
                originalIndex: personIndex,
                // 添加一个唯一标识，用于区分同一人员的不同卡牌实例
                cardIndex: i
            }
        })
    }
    else {
        // 只取前 totalCount 个，并为每个人员添加 originalIndex 属性
        tableData = allPersonList.slice(0, totalCount).map((person, index) => ({
            ...person,
            originalIndex: index
        }))
    }
    tableData = filterData(tableData.slice(0, totalCount), rowCount)
    return tableData
}

/**
 * @description 横铺图形：处理数据，把每个卡片在界面的位置写入
 * @param0 tableData 表格数据
 * @param1 rowCount 每行有多少个元素
 * @param2 cardSize 卡片的大小
 * @returns  Object3D[]
 */
export function createTableVertices({ tableData, rowCount, cardSize }: { tableData: IPersonConfig[], rowCount: number, cardSize: { width: number, height: number } }): Object3D[] {
    const tableLen = tableData.length
    const objects: Object3D[] = []
    for (let i = 0; i < tableLen; i++) {
        const object = new Object3D()

        object.position.x = tableData[i].x * (cardSize.width + 40) - rowCount * 90
        object.position.y = -tableData[i].y * (cardSize.height + 20) + 1000
        object.position.z = 0
        objects.push(object)
        // targets.table.push(object)
    }
    return objects
}
/**
 * @description 创建球体
 * @param0 objectsLength 物体的个数
 * @returns Object3D[]
 */
export function createSphereVertices({ objectsLength }: { objectsLength: number }): Object3D[] {
    let i = 0
    const resObjects: Object3D[] = []
    // const objLength = objects.value.length
    const vector = new Vector3()

    for (; i < objectsLength; ++i) {
        const phi = Math.acos(-1 + (2 * i) / objectsLength)
        const theta = Math.sqrt(objectsLength * Math.PI) * phi
        const object = new Object3D()

        object.position.x = 800 * Math.cos(theta) * Math.sin(phi)
        object.position.y = 800 * Math.sin(theta) * Math.sin(phi)
        object.position.z = -800 * Math.cos(phi)

        // rotation object
        vector.copy(object.position).multiplyScalar(2)
        object.lookAt(vector)
        resObjects.push(object)
    }
    return resObjects
}

export function confettiFire() {
    const duration = 3 * 1000
    const end = Date.now() + duration;
    (function frame() {
        // launch a few confetti from the left edge
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
        })
        // and launch a few from the right edge
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
        })

        // keep going until we are out of time
        if (Date.now() < end) {
            requestAnimationFrame(frame)
        }
    }())
    centerFire(0.25, {
        spread: 26,
        startVelocity: 55,
    })
    centerFire(0.2, {
        spread: 60,
    })
    centerFire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    })
    centerFire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    })
    centerFire(0.1, {
        spread: 120,
        startVelocity: 45,
    })
}
function centerFire(particleRatio: number, opts: any) {
    const count = 200
    confetti({
        origin: { y: 0.7 },
        ...opts,
        particleCount: Math.floor(count * particleRatio),
    })
}
