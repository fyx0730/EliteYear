import type { IPersonConfig, IPrizeConfig } from '@/types/storeType'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref, toRaw } from 'vue'
import { IndexDb } from '@/utils/dexie'
import { defaultPersonList } from './data'
import { usePrizeConfig } from './prizeConfig'
import { BLACKLIST } from '@/constant/blacklist'

// 获取IPersonConfig的key组成数组
export const personListKey = Object.keys(defaultPersonList[0])
export const usePersonConfig = defineStore('person', () => {
    const personDb = new IndexDb('person', ['allPersonList', 'alreadyPersonList'], 1, ['createTime'])
    // NOTE: state
    const personConfig = ref({
        allPersonList: [] as IPersonConfig[],
        alreadyPersonList: [] as IPersonConfig[],
    })
    personDb.getDataSortedByDateTime('allPersonList', 'createTime').then((data) => {
        personConfig.value.allPersonList = data
    })
    personDb.getAllData('alreadyPersonList').then((data) => {
        personConfig.value.alreadyPersonList = data
    })

    // NOTE: getter
    // 获取全部配置
    const getPersonConfig = computed(() => personConfig.value)
    // 获取全部人员名单
    const getAllPersonList = computed(() => personConfig.value.allPersonList)
    
    // 判断人员是否在黑名单中
    function isPersonBlacklisted(person: IPersonConfig): boolean {
        if (BLACKLIST.length === 0) {
            return false
        }
        
        // 获取人员在 allPersonList 中的索引位置（编号 = 索引 + 1）
        const personIndex = personConfig.value.allPersonList.findIndex(p => {
            // 通过 uuid 匹配（最准确）
            if (p.uuid && person.uuid && p.uuid === person.uuid) {
                return true
            }
            // 通过姓名匹配（备用）
            if (p.name && person.name && p.name === person.name) {
                return true
            }
            return false
        })
        
        // 如果找不到人员，返回 false
        if (personIndex < 0) {
            return false
        }
        
        // 人员在列表中的编号（从1开始）
        const personNumber = personIndex + 1
        
        for (const [id, name] of BLACKLIST) {
            // 如果配置了编号且匹配（编号 = 索引 + 1）
            if (id > 0 && personNumber === id) {
                return true
            }
            
            // 如果配置了姓名且匹配
            if (name && person.name && person.name === name) {
                return true
            }
        }
        
        return false
    }
    
    // 获取未获此奖的人员名单（排除黑名单）
    const getNotThisPrizePersonList = computed(() => {
        const currentPrize = usePrizeConfig().prizeConfig.currentPrize
        const data = personConfig.value.allPersonList.filter((item: IPersonConfig) => {
            const hasPrize = item.prizeId.includes(currentPrize.id as string)
            const isBlacklisted = isPersonBlacklisted(item)
            return !hasPrize && !isBlacklisted
        })

        return data
    })

    // 获取已中奖人员名单（按中奖时间排序）
    const getAlreadyPersonList = computed(() => {
        const list = personConfig.value.allPersonList.filter((item: IPersonConfig) => {
            return item.isWin === true
        })
        // 按中奖时间排序（最新的在前）
        return list.sort((a: IPersonConfig, b: IPersonConfig) => {
            // 获取最后一次中奖时间
            const aLastTime = a.prizeTime && a.prizeTime.length > 0 
                ? a.prizeTime[a.prizeTime.length - 1] 
                : ''
            const bLastTime = b.prizeTime && b.prizeTime.length > 0 
                ? b.prizeTime[b.prizeTime.length - 1] 
                : ''
            
            // 如果时间相同，按 id 排序（保持稳定排序）
            if (aLastTime === bLastTime) {
                return (a.id || 0) - (b.id || 0)
            }
            
            // 按时间降序排序（最新的在前）
            return bLastTime.localeCompare(aLastTime)
        })
    })
    // 获取中奖人员详情
    const getAlreadyPersonDetail = computed(() => personConfig.value.alreadyPersonList)
    // 获取未中奖人员名单（排除黑名单）
    const getNotPersonList = computed(() => {
        return personConfig.value.allPersonList.filter((item: IPersonConfig) => {
            const isBlacklisted = isPersonBlacklisted(item)
            return item.isWin === false && !isBlacklisted
        })
    })
    // NOTE: action
    // 添加全部未中奖人员
    function addNotPersonList(personList: IPersonConfig[]) {
        if (personList.length <= 0) {
            return
        }
        personList.forEach((item: IPersonConfig) => {
            personConfig.value.allPersonList.push(item)
        })
        personDb.setAllData('allPersonList', personList)
    }
    // 添加数据
    function addOnePerson(person: IPersonConfig[]) {
        if (person.length <= 0) {
            return
        }
        if (person.length > 1) {
            console.warn('只支持添加单个用户')
            return
        }
        person.forEach((item: IPersonConfig) => {
            // 为新添加的人员设置 orderIndex，确保排序正确
            // 如果已有 orderIndex 则保持不变，否则设置为当前列表长度（追加到最后）
            if (item.orderIndex === undefined) {
                const maxOrderIndex = personConfig.value.allPersonList.length > 0
                    ? Math.max(...personConfig.value.allPersonList.map(p => (p as any).orderIndex ?? -1)) + 1
                    : 0
                ;(item as any).orderIndex = maxOrderIndex
            }
            personConfig.value.allPersonList.push(item)
            personDb.setData('allPersonList', item)
        })
    }
    // 添加已中奖人员
    function addAlreadyPersonList(personList: IPersonConfig[], prize: IPrizeConfig | null) {
        if (personList.length <= 0) {
            return
        }
        personList.forEach((person: IPersonConfig) => {
            personConfig.value.allPersonList.map((item: IPersonConfig) => {
                if (item.id === person.id && prize != null) {
                    item.isWin = true
                    // person.isWin = true
                    item.prizeName.push(prize.name)
                    // person.prizeName += prize.name
                    item.prizeTime.push(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
                    // person.prizeTime = new Date().toString()
                    item.prizeId.push(prize.id as string)
                }
                return item
            })
            personConfig.value.alreadyPersonList.push(person)
            personDb.updateData('allPersonList', toRaw(person))
            personDb.setData('alreadyPersonList', toRaw(person))
        })
    }
    // 从已中奖移动到未中奖
    function moveAlreadyToNot(person: IPersonConfig) {
        if (person.id === undefined || person.id == null) {
            return
        }
        
        // 记录该人员获得的奖项ID，用于更新奖项的已使用计数
        const personPrizeIds = person.prizeId || []
        
        // 更新奖项的 isUsedCount
        if (personPrizeIds.length > 0) {
            const prizeConfigStore = usePrizeConfig()
            
            // 统计每个奖项ID出现的次数（虽然理论上每个ID只会出现一次）
            const prizeIdCounts = new Map<string, number>()
            personPrizeIds.forEach((prizeId: string) => {
                prizeIdCounts.set(prizeId, (prizeIdCounts.get(prizeId) || 0) + 1)
            })
            
            // 对每个奖项减少相应的计数
            prizeIdCounts.forEach((count, prizeId) => {
                const prize = prizeConfigStore.getPrizeConfigById(prizeId)
                if (prize && prize.isUsedCount > 0) {
                    // 减少已使用计数，但不能小于0
                    prize.isUsedCount = Math.max(0, prize.isUsedCount - count)
                    
                    // 如果奖项之前被标记为已用完，现在需要重置
                    if (prize.isUsed && prize.isUsedCount < prize.count) {
                        prize.isUsed = false
                    }
                    
                    // 如果有分段计数，也需要更新
                    if (prize.separateCount && prize.separateCount.enable && prize.separateCount.countList.length > 0) {
                        let remainingToDecrease = count
                        // 从最后一个有已使用计数的分段开始减少
                        for (let i = prize.separateCount.countList.length - 1; i >= 0 && remainingToDecrease > 0; i--) {
                            if (prize.separateCount.countList[i].isUsedCount > 0) {
                                const decreaseAmount = Math.min(prize.separateCount.countList[i].isUsedCount, remainingToDecrease)
                                prize.separateCount.countList[i].isUsedCount -= decreaseAmount
                                remainingToDecrease -= decreaseAmount
                            }
                        }
                    }
                }
            })
        }
        
        const alreadyPersonListLength = personConfig.value.alreadyPersonList.length
        for (let i = 0; i < personConfig.value.allPersonList.length; i++) {
            if (person.id === personConfig.value.allPersonList[i].id) {
                personConfig.value.allPersonList[i].isWin = false
                personConfig.value.allPersonList[i].prizeName = []
                personConfig.value.allPersonList[i].prizeTime = []
                personConfig.value.allPersonList[i].prizeId = []
                personDb.updateData('allPersonList', toRaw(personConfig.value.allPersonList[i]))
                break
            }
        }
        const alreadyPersonListRaw = toRaw(personConfig.value.alreadyPersonList)
        for (let i = 0; i < alreadyPersonListLength; i++) {
            personConfig.value.alreadyPersonList = alreadyPersonListRaw.filter((item: IPersonConfig) =>
                item.id !== person.id,
            )
        }
        personDb.deleteData('alreadyPersonList', person)
    }
    // 删除指定人员
    function deletePerson(person: IPersonConfig) {
        if (person.id !== undefined || person.id != null) {
            const allPersonListRaw = toRaw(personConfig.value.allPersonList)
            const alreadyPersonListRaw = toRaw(personConfig.value.alreadyPersonList)
            personConfig.value.allPersonList = allPersonListRaw.filter((item: IPersonConfig) => item.id !== person.id)
            personConfig.value.alreadyPersonList = alreadyPersonListRaw.filter((item: IPersonConfig) => item.id !== person.id)
            personDb.deleteData('allPersonList', person)
            personDb.deleteData('alreadyPersonList', person)
        }
    }
    // 删除所有人员
    function deleteAllPerson() {
        personConfig.value.allPersonList = []
        personConfig.value.alreadyPersonList = []
        personDb.deleteAll('allPersonList')
        personDb.deleteAll('alreadyPersonList')
    }

    // 删除所有人员
    function resetPerson() {
        personConfig.value.allPersonList = []
        personConfig.value.alreadyPersonList = []
        personDb.deleteAll('allPersonList')
        personDb.deleteAll('alreadyPersonList')
    }
    // 重置已中奖人员
    function resetAlreadyPerson() {
        // 把已中奖人员合并到未中奖人员，要验证是否已存在
        personConfig.value.allPersonList.forEach((item: IPersonConfig) => {
            item.isWin = false
            item.prizeName = []
            item.prizeTime = []
            item.prizeId = []
        })
        personConfig.value.alreadyPersonList = []
        const allPersonListRaw = toRaw(personConfig.value.allPersonList)
        personDb.deleteAll('allPersonList')
        personDb.setAllData('allPersonList', allPersonListRaw)
        personDb.deleteAll('alreadyPersonList')
    }
    function setDefaultPersonList() {
        personConfig.value.allPersonList = defaultPersonList.map((item: any) => {
            item.uuid = uuidv4()
            return item
        })
        personConfig.value.alreadyPersonList = []
        personDb.setAllData('allPersonList', defaultPersonList)
        personDb.deleteAll('alreadyPersonList')
    }
    // 重置所有配置
    function reset() {
        personConfig.value = {
            allPersonList: [] as IPersonConfig[],
            alreadyPersonList: [] as IPersonConfig[],
        }
        personDb.deleteAll('allPersonList')
        personDb.deleteAll('alreadyPersonList')
    }
    return {
        personConfig,
        getPersonConfig,
        getAllPersonList,
        getNotThisPrizePersonList,
        getAlreadyPersonList,
        getAlreadyPersonDetail,
        getNotPersonList,
        addNotPersonList,
        addOnePerson,
        addAlreadyPersonList,
        moveAlreadyToNot,
        deletePerson,
        deleteAllPerson,
        resetPerson,
        resetAlreadyPerson,
        setDefaultPersonList,
        reset,
    }
})
