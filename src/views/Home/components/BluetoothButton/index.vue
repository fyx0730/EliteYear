<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'

const props = defineProps<{
    isConnected: boolean
    connect: () => Promise<void>
    disconnect: () => Promise<void>
}>()

const { t } = useI18n()
const toast = useToast()

async function handleClick() {
    try {
        if (props.isConnected) {
            await props.disconnect()
            toast.open({
                message: '蓝牙已断开',
                type: 'info',
                position: 'top-right',
                duration: 2000,
            })
        } else {
            await props.connect()
            toast.open({
                message: '蓝牙连接成功',
                type: 'success',
                position: 'top-right',
                duration: 2000,
            })
        }
    } catch (error: any) {
        toast.open({
            message: `蓝牙连接失败: ${error.message || error}`,
            type: 'error',
            position: 'top-right',
            duration: 3000,
        })
    }
}
</script>

<template>
    <button
        class="btn btn-sm gap-2"
        :class="isConnected ? 'btn-success' : 'btn-outline btn-primary'"
        @click="handleClick"
        :title="isConnected ? '点击断开蓝牙连接' : '点击连接蓝牙按钮'"
    >
        <svg v-if="isConnected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        <span class="hidden sm:inline">{{ isConnected ? '蓝牙已连接' : '连接蓝牙' }}</span>
        <span class="sm:hidden">{{ isConnected ? '已连接' : '连接' }}</span>
    </button>
</template>

<style scoped lang="scss">
.btn {
    transition: all 0.2s ease;
    
    &:hover {
        transform: scale(1.05);
    }
    
    &:active {
        transform: scale(0.95);
    }
}
</style>
