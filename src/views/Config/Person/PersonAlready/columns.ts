import type { IPersonConfig } from '@/types/storeType'
import i18n from '@/locales/i18n'
import useStore from '@/store'

interface IColumnsProps {
    showPrizeTime?: boolean
    handleDeletePerson: (row: IPersonConfig) => void
    allPersonList: IPersonConfig[] // 全部人员列表，用于查找真实编号（必需）
}

export function tableColumns(props: IColumnsProps) {
    const columns = [
        {
            label: i18n.global.t('data.number'),
            props: 'uid',
            sort: false, // 默认按时间排序，不启用编号排序
            formatValue(row: any, index: number) {
                // 使用传入的 allPersonList，确保使用最新的数据
                const allPersonList = props.allPersonList || []
                
                // 安全检查：确保 allPersonList 是数组且不为空，且 row 有 id
                if (Array.isArray(allPersonList) && allPersonList.length > 0 && row) {
                    // 方法1：直接通过 id 查找（id 是 number 类型）
                    // 列表模式下，row 应该就是 allPersonList 中的对象引用
                    // 所以可以直接通过引用查找，或者通过 id 查找
                    if (row.id !== undefined && row.id !== null) {
                        // 首先尝试通过引用查找（最快）
                        const directIndex = allPersonList.indexOf(row)
                        if (directIndex >= 0) {
                            return (directIndex + 1).toString()
                        }
                        
                        // 如果引用查找失败，通过 id 查找
                        let personIndex = allPersonList.findIndex((person: IPersonConfig) => {
                            // 严格匹配 id
                            return person.id === row.id
                        })
                        
                        // 如果严格匹配失败，尝试类型转换后匹配
                        if (personIndex < 0) {
                            personIndex = allPersonList.findIndex((person: IPersonConfig) => {
                                return String(person.id) === String(row.id) || 
                                       Number(person.id) === Number(row.id)
                            })
                        }
                        
                        if (personIndex >= 0) {
                            return (personIndex + 1).toString()
                        }
                    }
                    
                    // 方法2：通过 uuid 匹配
                    if (row.uuid) {
                        const personIndexByUuid = allPersonList.findIndex((person: IPersonConfig) => {
                            return person.uuid === row.uuid
                        })
                        if (personIndexByUuid >= 0) {
                            return (personIndexByUuid + 1).toString()
                        }
                    }
                    
                    // 方法3：通过 name 和 department 匹配（作为后备方案）
                    if (row.name && row.department) {
                        const personIndexByName = allPersonList.findIndex((person: IPersonConfig) => {
                            return person.name === row.name && person.department === row.department
                        })
                        if (personIndexByName >= 0) {
                            return (personIndexByName + 1).toString()
                        }
                    }
                    
                    // 方法4：通过 name 单独匹配（如果 name 唯一）
                    if (row.name) {
                        const matchesByName = allPersonList.filter((person: IPersonConfig) => {
                            return person.name === row.name
                        })
                        // 如果只有一个匹配，使用它
                        if (matchesByName.length === 1) {
                            const personIndex = allPersonList.indexOf(matchesByName[0])
                            if (personIndex >= 0) {
                                return (personIndex + 1).toString()
                            }
                        }
                    }
                    
                    // 调试：如果所有方法都失败，输出详细信息（仅第一条）
                    if (index === 0) {
                        console.log('编号匹配调试信息:', {
                            rowId: row.id,
                            rowIdType: typeof row.id,
                            rowUuid: row.uuid,
                            rowName: row.name,
                            rowDepartment: row.department,
                            allPersonListLength: allPersonList.length,
                            directIndexResult: allPersonList.indexOf(row),
                            firstFewPersons: allPersonList.slice(0, 5).map((p, i) => ({ 
                                index: i, 
                                id: p.id, 
                                idType: typeof p.id,
                                name: p.name,
                                isSameObject: p === row
                            })),
                            rowObjectKeys: Object.keys(row),
                            firstPersonKeys: Object.keys(allPersonList[0] || {})
                        })
                    }
                }
                // 后备方案：使用当前索引+1（这不应该发生，但如果发生了，至少显示一个数字）
                return (index + 1).toString()
            },
        },
        {
            label: i18n.global.t('data.name'),
            props: 'name',
        },
        {
            label: i18n.global.t('data.avatar'),
            props: 'avatar',
            formatValue(row: any) {
                return row.avatar ? `<img src="${row.avatar}" alt="avatar" style="width: 50px; height: 50px;"/>` : '-'
            },
        },
        {
            label: i18n.global.t('data.department'),
            props: 'department',
        },
        {
            label: i18n.global.t('data.prizeName'),
            props: 'prizeName',
            sort: true,
        },
    ]
    
    // 如果显示获奖时间，添加该列
    if (props.showPrizeTime) {
        columns.push({
            label: i18n.global.t('data.prizeTime'),
            props: 'prizeTime',
        } as any)
    }
    
    // 添加操作列
    columns.push({
        label: i18n.global.t('data.operation'),
        actions: [
            {
                label: '移入未中奖',
                type: 'btn-warning btn-xs normal-case',
                onClick: (row: IPersonConfig) => {
                    // 直接调用 handleDeletePerson，确认对话框在 useViewModel 中处理
                    props.handleDeletePerson(row)
                },
            },
        ],
    } as any)
    
    return columns
}
