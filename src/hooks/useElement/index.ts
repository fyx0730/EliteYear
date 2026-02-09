import type { IPersonConfig } from '@/types/storeType'
import { rgba } from '@/utils/color'

interface IUseElementStyle {
    element: any
    person: IPersonConfig & { originalIndex?: number }
    index: number
    patternList: number[]
    patternColor: string
    cardColor: string
    cardSize: { width: number, height: number }
    scale: number
    textSize: number
    mod: 'default' | 'lucky' | 'sphere'
    type?: 'add' | 'change'
    cardOpacity?: number // 卡片透明度 (0-1)

}
export function useElementStyle(props: IUseElementStyle) {
    const { element, person, index, patternList, patternColor, cardColor, cardSize, scale, textSize, mod, type, cardOpacity = 0.5 } = props
    // 使用配置的透明度值，允许一定的随机变化
    const baseOpacity = cardOpacity
    const opacityVariation = 0.1 // 允许 ±0.1 的随机变化
    
    if (patternList.includes(index + 1) && mod === 'default') {
        // 图案卡片使用较高的透明度
        element.style.backgroundColor = rgba(patternColor, Math.min(1, baseOpacity + opacityVariation * 2 + Math.random() * 0.2))
    }
    else if (mod === 'sphere' || mod === 'default') {
        // 普通卡片使用配置的透明度，允许小幅随机变化
        const randomVariation = (Math.random() - 0.5) * opacityVariation * 2
        element.style.backgroundColor = rgba(cardColor, Math.max(0, Math.min(1, baseOpacity + randomVariation)))
    }
    else if (mod === 'lucky') {
        // 中奖卡片使用稍高的透明度
        element.style.backgroundColor = rgba(cardColor, Math.min(1, baseOpacity + 0.3))
    }
    element.style.border = `1px solid ${rgba(cardColor, 0.25)}`
    element.style.boxShadow = `0 0 12px ${rgba(cardColor, 0.5)}`
    element.style.width = `${cardSize.width * scale}px`
    element.style.height = `${cardSize.height * scale}px`
    if (mod === 'lucky') {
        element.className = 'lucky-element-card'
    }
    else {
        element.className = 'element-card'
    }
    if (type === 'add') {
        element.addEventListener('mouseenter', (ev: MouseEvent) => {
            const target = ev.target as HTMLElement
            target.style.border = `1px solid ${rgba(cardColor, 0.75)}`
            target.style.boxShadow = `0 0 12px ${rgba(cardColor, 0.75)}`
        })
        element.addEventListener('mouseleave', (ev: MouseEvent) => {
            const target = ev.target as HTMLElement
            target.style.border = `1px solid ${rgba(cardColor, 0.25)}`
            target.style.boxShadow = `0 0 12px ${rgba(cardColor, 0.5)}`
        })
    }
    // 优化编号：增大字体并居中显示
    element.children[0].style.fontSize = `${textSize * scale * 0.65}px`
    element.children[0].style.lineHeight = `${textSize * scale * 0.8}px`
    element.children[0].style.textAlign = 'center'
    // 使用 originalIndex + 1 作为编号，对应人员在 allPersonList 中的位置
    // 如果没有 originalIndex，则使用 index + 1 作为后备方案
    const originalIndex = person.originalIndex !== undefined ? person.originalIndex : index
    element.children[0].textContent = (originalIndex + 1).toString()

    // 主名称：使用更合理的行高比例（1.3-1.5倍字体大小）
    element.children[1].style.fontSize = `${textSize * scale}px`
    element.children[1].style.lineHeight = `${textSize * scale * 1.4}px`
    element.children[1].style.textShadow = `0 0 12px ${rgba(cardColor, 0.95)}`
    element.children[1].style.letterSpacing = '0.02em'
    if (person.name) {
        element.children[1].textContent = person.name
    }

    // 详细信息：使用更合理的行高
    element.children[2].style.fontSize = `${textSize * scale * 0.5}px`
    element.children[2].style.lineHeight = `${textSize * scale * 0.75}px`
    // 只显示部门，不显示身份
    element.children[2].innerHTML = ''
    if (person.department) {
        element.children[2].innerHTML = person.department
    }
    element.children[3].src = person.avatar
    return element
}
interface CardRule {
    [key: number]: {
        maxLine: number
        scale: number
        rule: number[]
        length: number
    }
}
const cardRule: CardRule = {
    1: {
        maxLine: 5,
        scale: 2,
        rule: [1],
        length: 1,
    },
    2: {
        maxLine: 5,
        scale: 2,
        rule: [2],
        length: 1,
    },
    3: {
        maxLine: 5,
        scale: 2,
        rule: [3],
        length: 1,
    },
    4: {
        maxLine: 5,
        scale: 2,
        rule: [4],
        length: 1,
    },
    5: {
        maxLine: 5,
        scale: 2,
        rule: [5],
        length: 1,
    },
    6: {
        maxLine: 3,
        scale: 2,
        rule: [3, 3],
        length: 2,
    },
    7: {
        maxLine: 4,
        scale: 2,
        rule: [3, 4],
        length: 2,
    },
    8: {
        maxLine: 5,
        scale: 2,
        rule: [3, 5],
        length: 2,
    },
    9: {
        maxLine: 5,
        scale: 2,
        rule: [4, 5],
        length: 2,
    },
    10: {
        maxLine: 5,
        scale: 2,
        rule: [5, 5],
        length: 2,
    },
    11: {
        maxLine: 6,
        scale: 1.8,
        rule: [5, 6],
        length: 2,
    },
    12: {
        maxLine: 6,
        scale: 1.8,
        rule: [6, 6],
        length: 2,
    },
    13: {
        maxLine: 7,
        scale: 1.6,
        rule: [6, 7],
        length: 2,
    },
    14: {
        maxLine: 7,
        scale: 1.6,
        rule: [7, 7],
        length: 2,
    },
    15: {
        maxLine: 8,
        scale: 1.5,
        rule: [7, 8],
        length: 2,
    },
    16: {
        maxLine: 8,
        scale: 1.5,
        rule: [8, 8],
        length: 2,
    },
    17: {
        maxLine: 6,
        scale: 1.8,
        rule: [5, 6, 6],
        length: 3,
    },
    18: {
        maxLine: 6,
        scale: 1.8,
        rule: [6, 6, 6],
        length: 3,
    },
    19: {
        maxLine: 7,
        scale: 1.6,
        rule: [6, 6, 7],
        length: 3,
    },
    20: {
        maxLine: 5,
        scale: 1.6,
        rule: [6, 7, 7],
        length: 3,
    },
    21: {
        maxLine: 7,
        scale: 1.6,
        rule: [7, 7, 7],
        length: 3,
    },
    22: {
        maxLine: 8,
        scale: 1.5,
        rule: [7, 7, 8],
        length: 3,
    },
    23: {
        maxLine: 8,
        scale: 1.5,
        rule: [7, 8, 8],
        length: 3,
    },
    24: {
        maxLine: 8,
        scale: 1.5,
        rule: [8, 8, 8],
        length: 3,
    },
    25: {
        maxLine: 9,
        scale: 1.3,
        rule: [8, 8, 9],
        length: 3,
    },
    26: {
        maxLine: 9,
        scale: 1.3,
        rule: [8, 9, 9],
        length: 3,
    },
    27: {
        maxLine: 9,
        scale: 1.3,
        rule: [9, 9, 9],
        length: 3,
    },
    28: {
        maxLine: 10,
        scale: 1.2,
        rule: [9, 9, 10],
        length: 3,
    },
    29: {
        maxLine: 10,
        scale: 1.2,
        rule: [9, 10, 10],
        length: 3,
    },
    30: {
        maxLine: 10,
        scale: 1.2,
        rule: [10, 10, 10],
        length: 3,
    },
}
/**
 * @description 动态生成卡片布局规则（用于超过30人的情况）
 */
function generateCardRule(totalCount: number): { scale: number, rule: number[], length: number } {
    // 如果已有规则，直接返回
    if (cardRule[totalCount]) {
        const rule = cardRule[totalCount]
        return { scale: rule.scale, rule: rule.rule, length: rule.length }
    }

    // 动态生成规则
    let scale = 1.0
    let rule: number[] = []
    let length = 1

    if (totalCount <= 5) {
        // 1-5人：单行
        scale = 2.0
        rule = [totalCount]
        length = 1
    } else if (totalCount <= 10) {
        // 6-10人：两行，尽量平均分配
        scale = 2.0
        const firstRow = Math.ceil(totalCount / 2)
        rule = [firstRow, totalCount - firstRow]
        length = 2
    } else if (totalCount <= 20) {
        // 11-20人：两行或三行
        scale = 1.5
        if (totalCount <= 15) {
            const firstRow = Math.ceil(totalCount / 2)
            rule = [firstRow, totalCount - firstRow]
            length = 2
        } else {
            const perRow = Math.ceil(totalCount / 3)
            rule = [perRow, perRow, totalCount - perRow * 2]
            length = 3
        }
    } else if (totalCount <= 30) {
        // 21-30人：三行
        scale = 1.2
        const perRow = Math.ceil(totalCount / 3)
        rule = [perRow, perRow, totalCount - perRow * 2]
        length = 3
    } else {
        // 超过30人：多行布局
        scale = Math.max(0.8, 1.2 - (totalCount - 30) * 0.02) // 根据人数动态调整缩放
        const rows = Math.ceil(Math.sqrt(totalCount * 1.5)) // 计算合适的行数
        const perRow = Math.ceil(totalCount / rows)
        rule = []
        let remaining = totalCount
        for (let i = 0; i < rows; i++) {
            if (i === rows - 1) {
                rule.push(remaining)
            } else {
                rule.push(perRow)
                remaining -= perRow
            }
        }
        length = rows
    }

    return { scale, rule, length }
}

/**
 * @description 设置抽中卡片的位置（动态居中）
 */
export function useElementPosition(
    element: any,
    count: number,
    totalCount: number,
    cardSize: { width: number, height: number },
    windowSize: { width: number, height: number },
    cardIndex: number,
): {
    xTable: number
    yTable: number
    scale: number
} {
    // 获取布局规则（支持动态生成）
    const { scale, rule, length } = generateCardRule(totalCount)
    
    // 计算缩放后的卡片尺寸
    const scaledCardWidth = cardSize.width * scale
    const scaledCardHeight = cardSize.height * scale
    
    // 计算当前卡片在第几行（从0开始）
    let currentRow = 0
    let cardIndexInRow = cardIndex

    // 根据规则确定卡片在哪一行及行内索引
    let cumulativeCount = 0
    for (let i = 0; i < rule.length; i++) {
        if (cardIndex < cumulativeCount + rule[i]) {
            currentRow = i
            cardIndexInRow = cardIndex - cumulativeCount
            break
        }
        cumulativeCount += rule[i]
    }

    // 计算当前行的卡片数量
    const cardsInCurrentRow = rule[currentRow]

    // 在 Three.js CSS3DRenderer 中，坐标系统以屏幕中心为原点 (0, 0)
    // X轴：左负右正，Y轴：上正下负（或上负下正，取决于相机设置）
    // 我们需要计算相对于屏幕中心的偏移量

    // 计算垂直方向：整体高度和每行的垂直间距
    const verticalSpacing = scaledCardHeight * 1.1 // 垂直间距基于缩放后的高度
    const totalHeight = (length - 1) * verticalSpacing + scaledCardHeight // 整体高度
    
    // 计算垂直位置：从屏幕中心(0)开始
    // 在 CSS3DRenderer 中，Y轴通常是上正下负（或上负下正，取决于相机）
    // 为了居中显示，我们需要计算相对于屏幕中心的偏移
    // 第一行应该在中心上方，所以使用负值
    const startY = -totalHeight / 2 + scaledCardHeight / 2
    const yTable = startY + currentRow * verticalSpacing

    // 计算水平方向：当前行的宽度和水平间距
    const horizontalSpacing = scaledCardWidth * 1.2 // 水平间距基于缩放后的宽度
    const rowWidth = (cardsInCurrentRow - 1) * horizontalSpacing

    // 计算水平位置：从屏幕中心(0)开始，向左偏移行宽度的一半，然后加上当前卡片的偏移
    // 当只有1个卡片时，rowWidth = 0，所以 xTable = 0（屏幕中心）
    const startX = -rowWidth / 2
    const xTable = startX + cardIndexInRow * horizontalSpacing

    return { xTable, yTable, scale }
}
