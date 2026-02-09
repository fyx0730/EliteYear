import type { IPersonConfig } from '@/types/storeType'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import useStore from '@/store'
import { tableColumns } from './columns'

export function useViewModel() {
    const personConfig = useStore().personConfig
    const prizeConfig = useStore().prizeConfig
    const toast = useToast()

    const { getAlreadyPersonList: alreadyPersonList, getAlreadyPersonDetail: alreadyPersonDetail, getAllPersonList: allPersonList } = storeToRefs(personConfig)
    const { getPrizeConfig: prizeList } = storeToRefs(prizeConfig)

    const isDetail = ref(false)
    const selectedPrizeId = ref<string>('all')
    
    // 确认对话框状态
    const confirmDialogVisible = ref(false)
    const confirmDialogTitle = ref('')
    const confirmDialogDesc = ref('')
    const confirmDialogCallback = ref<(() => void) | null>(null)

    // 筛选后的中奖人员列表
    const filteredAlreadyPersonList = computed(() => {
        if (selectedPrizeId.value === 'all') {
            return alreadyPersonList.value
        }
        return alreadyPersonList.value.filter((person: IPersonConfig) => {
            return person.prizeId.includes(selectedPrizeId.value)
        })
    })

    // 筛选后的中奖详情
    const filteredAlreadyPersonDetail = computed(() => {
        if (selectedPrizeId.value === 'all') {
            return alreadyPersonDetail.value
        }
        return alreadyPersonDetail.value.filter((person: IPersonConfig) => {
            return person.prizeId.includes(selectedPrizeId.value)
        })
    })

    // 显示确认对话框
    function showConfirmDialog(title: string, desc: string, callback: () => void) {
        confirmDialogTitle.value = title
        confirmDialogDesc.value = desc
        confirmDialogCallback.value = callback
        confirmDialogVisible.value = true
    }
    
    // 确认对话框提交
    function handleConfirmSubmit() {
        if (confirmDialogCallback.value) {
            confirmDialogCallback.value()
            confirmDialogCallback.value = null
        }
        confirmDialogVisible.value = false
    }
    
    // 确认对话框取消
    function handleConfirmCancel() {
        confirmDialogCallback.value = null
        confirmDialogVisible.value = false
    }

    function handleMoveNotPerson(row: IPersonConfig) {
        personConfig.moveAlreadyToNot(row)
    }

    // 批量移入未中奖名单
    function handleBatchMoveToNotWinner() {
        const listToMove = isDetail.value ? filteredAlreadyPersonDetail.value : filteredAlreadyPersonList.value
        if (listToMove.length === 0) {
            return
        }
        
        // 构建确认消息
        let title = ''
        let desc = ''
        if (selectedPrizeId.value === 'all') {
            title = '批量移入未中奖名单'
            desc = `确定将 ${listToMove.length} 位中奖人员移入未中奖名单吗？\n\n此操作将清除这些人员的所有中奖记录。`
        } else {
            const prizeName = prizeList.value.find(p => p.id === selectedPrizeId.value)?.name
            title = '批量移入未中奖名单'
            desc = `确定将「${prizeName}」的 ${listToMove.length} 位获奖人员移入未中奖名单吗？\n\n此操作将清除这些人员的所有中奖记录。`
        }
        
        // 显示确认对话框
        showConfirmDialog(title, desc, () => {
        listToMove.forEach((person: IPersonConfig) => {
            personConfig.moveAlreadyToNot(person)
        })
            
            // 操作成功提示
            toast.open({
                message: `成功将 ${listToMove.length} 位人员移入未中奖名单！`,
                type: 'success',
                position: 'top-right',
                duration: 3000,
            })
        })
    }

    // 使用 computed 确保列配置能够响应 allPersonList 的变化
    const tableColumnsList = computed(() => tableColumns({ 
        showPrizeTime: false,
        allPersonList: allPersonList.value, // 传递全部人员列表（响应式）
        handleDeletePerson: (row: IPersonConfig) => {
            const prizeName = Array.isArray(row.prizeName) ? row.prizeName.join('、') : row.prizeName
            showConfirmDialog(
                '移入未中奖名单',
                `确定将「${row.name}」从「${prizeName}」中移入未中奖名单吗？\n\n此操作将清除该人员的所有中奖记录。`,
                () => handleMoveNotPerson(row)
            )
        }
    }))
    const tableColumnsDetail = computed(() => tableColumns({ 
        showPrizeTime: true,
        allPersonList: allPersonList.value, // 传递全部人员列表（响应式）
        handleDeletePerson: (row: IPersonConfig) => {
            const prizeName = Array.isArray(row.prizeName) ? row.prizeName.join('、') : row.prizeName
            showConfirmDialog(
                '移入未中奖名单',
                `确定将「${row.name}」从「${prizeName}」中移入未中奖名单吗？\n\n此操作将清除该人员的所有中奖记录。`,
                () => handleMoveNotPerson(row)
            )
        }
    }))
    
    return {
        alreadyPersonList,
        alreadyPersonDetail,
        filteredAlreadyPersonList,
        filteredAlreadyPersonDetail,
        isDetail,
        tableColumnsList,
        tableColumnsDetail,
        prizeList,
        selectedPrizeId,
        handleBatchMoveToNotWinner,
        confirmDialogVisible,
        confirmDialogTitle,
        confirmDialogDesc,
        handleConfirmSubmit,
        handleConfirmCancel,
    }
}
