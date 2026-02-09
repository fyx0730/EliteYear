<script setup lang='ts'>
import { useFullscreen } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { Maximize, Minimize, TabletSmartphone } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import CustomDialog from '@/components/Dialog/index.vue'
import { useBackgroundMusicInstance } from '@/hooks/useBackgroundMusicInstance'
import { useBluetooth } from '@/hooks/useBluetooth'
import { useToast } from 'vue-toast-notification'
import useStore from '@/store'
import { getOriginUrl, getUniqueSignature } from '@/utils/auth'
import { usePlayMusic } from './usePlayMusic'

const serverConfig = useStore().serverConfig
const {
    getServerStatus: serverStatus,
} = storeToRefs(serverConfig)
const { playMusic, currentMusic, nextPlay } = usePlayMusic()

// 背景音乐管理器
const bgmController = useBackgroundMusicInstance()
const bgmIsPlaying = computed(() => bgmController.isPlaying.value)

// 切换背景音乐播放/暂停
function toggleBackgroundMusic() {
    bgmController.toggleBGM()
    // 触发用户交互，确保可以播放
    bgmController.onUserInteraction()
}

const { isFullscreen, toggle: toggleScreen } = useFullscreen()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// Toast 提示
const toast = useToast()

// 蓝牙功能（仅在 Home 页面启用）
const { 
    isConnected: isBluetoothConnected, 
    connect: connectBluetooth, 
    disconnect: disconnectBluetooth 
} = useBluetooth()

// 处理蓝牙连接
async function handleBluetoothConnect() {
    try {
        if (isBluetoothConnected.value) {
            await disconnectBluetooth()
            // 不显示断开提示
        } else {
            await connectBluetooth()
            // 不显示连接成功提示
        }
    } catch (error: any) {
        console.error('蓝牙操作失败:', error)
        toast.open({
            message: `蓝牙连接失败: ${error.message || error}`,
            type: 'error',
            position: 'top-right',
            duration: 3000,
        })
    }
}

// 监听蓝牙触发事件（仅在 Home 页面）
let lotteryTriggerHandler: (() => void) | null = null

function handleBluetoothLotteryTrigger() {
    // 触发自定义事件，让 Home 页面处理
    window.dispatchEvent(new CustomEvent('bluetooth-trigger-lottery'))
}

watch(() => route?.path, (path) => {
    if (!path) return
    
    // 移除旧的监听器
    if (lotteryTriggerHandler) {
        window.removeEventListener('lottery-trigger', lotteryTriggerHandler)
        lotteryTriggerHandler = null
    }
    
    // 只在 Home 页面添加监听器
    if (path.includes('/log-lottery') && !path.includes('/config')) {
        lotteryTriggerHandler = handleBluetoothLotteryTrigger
        window.addEventListener('lottery-trigger', lotteryTriggerHandler)
    }
}, { immediate: true })

const customDialogRef = ref()
const settingRef = ref()
const fullScreenRef = ref()
const mobileUrl = shallowRef<string>('')
const qrCodeImg = useQRCode(mobileUrl)
const visible = ref(true)

function enterConfig() {
    router.push('/log-lottery/config')
}
function enterHome() {
    router.push('/log-lottery')
}
async function openMobileQrCode() {
    const originUrl = getOriginUrl()
    const userSignature = await getUniqueSignature()
    mobileUrl.value = `${originUrl}/log-lottery/mobile?userSignature=${userSignature}`
    customDialogRef.value.showDialog()
}
function handleSubmit() {

}

watch(() => route, (val) => {
    const { meta } = val
    if (meta && meta.isMobile) {
        visible.value = false
    }
}, { immediate: true })

onMounted(() => {
    if (!settingRef.value) {
        return
    }
    settingRef.value.addEventListener('mouseenter', () => {
        fullScreenRef.value.style.display = 'block'
    })
    settingRef.value.addEventListener('mouseleave', () => {
        fullScreenRef.value.style.display = 'none'
    })
})

onUnmounted(() => {
    // 清理蓝牙事件监听
    if (lotteryTriggerHandler) {
        window.removeEventListener('lottery-trigger', lotteryTriggerHandler)
        lotteryTriggerHandler = null
    }
    // 注意：不在组件卸载时断开蓝牙连接，保持连接持久化
    // 蓝牙连接应该由用户手动控制断开
})
</script>

<template>
  <div v-if="visible" ref="settingRef" class="flex flex-col gap-3">
    <CustomDialog
      ref="customDialogRef"
      title=""
      :submit-func="handleSubmit"
      footer="center"
      dialog-class="h-120 p-6"
    >
      <template #content>
        <div class="flex w-full justify-center h-90">
          <img :src="qrCodeImg" alt="qr code">
        </div>
      </template>
    </CustomDialog>
    <div ref="fullScreenRef" class="tooltip tooltip-left hidden" @click="toggleScreen">
      <div
        v-if="isFullscreen"
        class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
      >
        <Minimize />
      </div>
      <div
        v-else
        class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
      >
        <Maximize />
      </div>
    </div>
    <div v-if="route.path.includes('/config')" class="tooltip tooltip-left" :data-tip="t('tooltip.toHome')">
      <div
        class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
        @click="enterHome"
      >
        <svg-icon name="home" />
      </div>
    </div>
    <div v-else class="tooltip tooltip-left" :data-tip="t('tooltip.settingConfiguration')">
      <div
        class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
        @click="enterConfig"
      >
        <svg-icon name="setting" />
      </div>
    </div>
    <div class="tooltip tooltip-left" :data-tip="bgmIsPlaying ? '暂停背景音乐' : '播放背景音乐'">
      <div
        class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
        @click="toggleBackgroundMusic"
      >
        <svg-icon :name="bgmIsPlaying ? 'pause' : 'play'" />
      </div>
    </div>
    <div class="tooltip tooltip-left" :data-tip="isBluetoothConnected ? '断开蓝牙连接' : '连接蓝牙按钮'">
      <div
        class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
        :class="{ 
          'bg-green-500/50 hover:bg-green-500/80 text-blue-500': isBluetoothConnected 
        }"
        @click="handleBluetoothConnect"
      >
        <svg-icon name="bluetooth" />
      </div>
    </div>
    <div v-if="serverStatus" class="tooltip tooltip-left" data-tip="访问手机端">
      <div class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90" @click="openMobileQrCode">
        <TabletSmartphone />
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
details {

    // display: none;
    summary {
        display: none;
    }
}
</style>
