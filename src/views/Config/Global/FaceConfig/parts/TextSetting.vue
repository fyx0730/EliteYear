<script setup lang='ts'>
import { useI18n } from 'vue-i18n'
import SelectFont from '../components/SelectFont.vue'

const { t } = useI18n()
const languageList = defineModel<any[]>('languageList')
const topTitleValue = defineModel<string>('topTitleValue', { default: '' })
const languageValue = defineModel<string>('languageValue', { default: 'zh-CN' })
const textSizeValue = defineModel<number>('textSizeValue')
const currentFontValue = defineModel<string>('currentFontValue', { default: '', type: String })
const currentTitleFontValue = defineModel<string>('currentTitleFontValue', { default: '', type: String })
const titleFontSyncGlobalValue = defineModel<boolean>('titleFontSyncGlobalValue')
</script>

<template>
  <fieldset class="p-6 border-2 fieldset bg-base-200/60 backdrop-blur-sm border-base-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
    <legend class="fieldset-legend px-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {{ t('table.textSetting') }}
    </legend>
    
    <div class="space-y-5 mt-2">
      <!-- 标题输入 -->
      <label for="top-title-input" class="form-control">
      <div class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-primary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.title') }}</span>
          </div>
      </div>
    <input
          id="top-title-input"
          name="top-title"
          v-model="topTitleValue" 
          type="text" 
          :placeholder="t('placeHolder.enterTitle')"
          class="w-full input input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 h-12"
    >
      </label>

      <!-- 语言选择 -->
      <label for="language-select" class="w-full form-control">
      <div class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-secondary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.language') }}</span>
          </div>
      </div>
        <select 
          id="language-select"
          name="language"
          v-model="languageValue" 
          data-choose-theme 
          class="w-full select select-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 cursor-pointer hover:border-primary/50 h-12"
        >
        <option disabled selected>{{ t('table.language') }}</option>
        <option v-for="item in languageList" :key="item.key" :value="item.key">{{ item.name }}</option>
      </select>
    </label>

      <!-- 文字大小 -->
      <label for="text-size-input" class="w-full form-control">
      <div class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-accent rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.textSize') }}</span>
          </div>
      </div>
      <input
          id="text-size-input"
          name="text-size"
          v-model="textSizeValue" 
          type="number" 
          placeholder="30"
          class="w-full input input-bordered border-2 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 h-12"
      >
    </label>

      <!-- 全局字体 -->
      <label class="w-full form-control">
        <div class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-info rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.globalFont') }}</span>
          </div>
        </div>
        <SelectFont v-model:selected-font="currentFontValue" />
      </label>

      <!-- 标题字体和同步选项 -->
      <div class="p-4 rounded-xl bg-base-300/20 border border-base-300/50">
        <label class="flex flex-col gap-4 form-control">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1 h-5 bg-success rounded-full" />
              <span class="label-text text-base font-medium">{{ t('table.titleFont') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="label-text text-sm">{{ t('table.syncGlobalFont') }}</span>
              <input 
                id="title-font-sync-checkbox"
                name="title-font-sync"
                type="checkbox" 
                :checked="titleFontSyncGlobalValue" 
                class="checkbox checkbox-primary cursor-pointer hover:scale-110 transition-transform duration-200"
                @change="titleFontSyncGlobalValue = !titleFontSyncGlobalValue"
              >
      </div>
        </div>
          <SelectFont 
            v-model:selected-font="currentTitleFontValue" 
            :disabled="titleFontSyncGlobalValue" 
          />
        </label>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>

</style>
