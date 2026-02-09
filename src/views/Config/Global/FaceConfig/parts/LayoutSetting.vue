<script setup lang='ts'>
import { useI18n } from 'vue-i18n'

interface Props {
    resetPersonLayout: () => void
    isRowCountChange: number
}
defineProps<Props>()

const { t } = useI18n()
const formErr = defineModel<{ rowCount: string }>('formErr', { required: true })
const formData = defineModel<{ rowCount: number }>('formData', { required: true })
const cardSizeValue = defineModel<{ width: number, height: number }>('cardSizeValue', { required: true })
const isShowPrizeListValue = defineModel<boolean>('isShowPrizeListValue', { required: true })
const isShowAvatarValue = defineModel<boolean>('isShowAvatarValue', { required: false })
</script>

<template>
  <fieldset class="p-6 border-2 fieldset bg-base-200/60 backdrop-blur-sm border-base-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
    <legend class="fieldset-legend px-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {{ t('table.layoutSetting') }}
    </legend>
    
    <div class="space-y-5 mt-2">
      <!-- 列数设置 -->
      <div class="form-control">
        <div class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-primary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.columnNumber') }}</span>
          </div>
          <span v-if="formErr.rowCount" class="text-xs text-error font-medium">
            {{ formErr.rowCount }}
          </span>
        </div>
        <div class="join w-full shadow-sm hover:shadow-md transition-shadow duration-200">
      <input
            id="row-count-input"
            name="row-count"
            v-model="formData.rowCount" 
            type="number" 
            placeholder="17"
            class="flex-1 input input-bordered join-item border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 h-12"
      >
      <div class="tooltip join-item" :data-tip="t('tooltip.resetLayout')">
            <button 
              class="btn btn-primary join-item cursor-pointer hover:shadow-lg transition-all duration-200 min-w-[120px] gap-2 h-12" 
              :disabled="isRowCountChange !== 1" 
              @click="resetPersonLayout"
            >
              <svg v-if="isRowCountChange !== 2" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
          <span>{{ t('button.setLayout') }}</span>
              <span v-show="isRowCountChange === 2" class="loading loading-ring loading-sm" />
        </button>
          </div>
      </div>
    </div>

      <!-- 卡片尺寸 -->
      <div class="p-4 rounded-xl bg-base-300/20 border border-base-300/50">
        <label class="flex flex-col sm:flex-row gap-4 form-control">
          <div class="flex-1">
        <div class="label">
              <span class="label-text font-medium">{{ t('table.cardWidth') }}</span>
        </div>
        <input
              id="card-width-input"
              name="card-width"
              v-model="cardSizeValue.width" 
              type="number" 
              placeholder="140"
              class="w-full input input-sm input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200"
        >
      </div>
          <div class="flex-1">
        <div class="label">
              <span class="label-text font-medium">{{ t('table.cardHeight') }}</span>
        </div>
        <input
              id="card-height-input"
              name="card-height"
              v-model="cardSizeValue.height" 
              type="number" 
              placeholder="200"
              class="w-full input input-sm input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200"
        >
      </div>
    </label>
      </div>

      <!-- 显示选项 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg bg-base-300/20 hover:bg-base-300/30 transition-colors duration-200">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="label-text font-medium">{{ t('table.alwaysDisplay') }}</span>
      </div>
      <input
            id="show-prize-list-checkbox"
            name="show-prize-list"
            type="checkbox" 
            :checked="isShowPrizeListValue" 
            class="checkbox checkbox-primary cursor-pointer hover:scale-110 transition-transform duration-200"
        @change="isShowPrizeListValue = !isShowPrizeListValue"
      >
    </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-base-300/20 hover:bg-base-300/30 transition-colors duration-200">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="label-text font-medium">{{ t('table.avatarDisplay') }}</span>
      </div>
      <input
            id="show-avatar-checkbox"
            name="show-avatar"
            type="checkbox" 
            :checked="isShowAvatarValue" 
            class="checkbox checkbox-secondary cursor-pointer hover:scale-110 transition-transform duration-200"
        @change="isShowAvatarValue = !isShowAvatarValue"
      >
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>

</style>
