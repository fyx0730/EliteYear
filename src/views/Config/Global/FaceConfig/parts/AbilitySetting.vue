<script setup lang='ts'>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const definiteTime = defineModel<number | null>('definiteTime', { required: true })
const winMusic = defineModel<boolean>('winMusic', { required: true })
</script>

<template>
  <fieldset class="p-6 border-2 fieldset bg-base-200/60 backdrop-blur-sm border-base-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
    <legend class="fieldset-legend px-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {{ t('table.abilitySetting') }}
    </legend>

    <div class="space-y-5 mt-2">
      <!-- 定时停止 -->
      <div class="form-control">
          <label class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-primary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.timedStop') }}</span>
            <div class="tooltip" :data-tip="t('tooltip.timedStop')">
              <button class="btn btn-circle btn-ghost btn-xs cursor-help hover:bg-base-300" aria-label="帮助信息">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            </div>
          </label>
        <div class="relative">
          <input
            id="definite-time-input"
            name="definite-time"
            v-model="definiteTime" 
            type="number" 
            :placeholder="t('placeHolder.timedStop')"
            class="w-full input input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 pr-12 h-12"
          >
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 text-sm pointer-events-none">
            秒
          </div>
        </div>
      </div>

      <!-- 播放获奖音乐 -->
      <div class="flex items-center justify-between p-4 rounded-xl bg-base-300/20 hover:bg-base-300/30 transition-colors duration-200 border border-base-300/50">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <div>
            <span class="label-text font-medium block">{{ t('table.playWinMusic') }}</span>
            <span class="text-xs text-base-content/60">开启后播放获奖音效和背景音乐</span>
          </div>
      </div>
      <input
          id="win-music-toggle"
          name="win-music"
          type="checkbox" 
          :checked="winMusic" 
          class="toggle toggle-primary cursor-pointer hover:scale-110 transition-transform duration-200"
        @change="winMusic = !winMusic"
      >
      </div>
    </div>
  </fieldset>
</template>

<style scoped>

</style>
