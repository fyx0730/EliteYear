<script setup lang='ts'>
import type { IImage } from '@/types/storeType'
import { reactive } from 'vue'
import { ColorPicker } from 'vue3-colorpicker'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { daisyuiThemes } from '@/constant/theme'
import 'vue3-colorpicker/style.css'

interface Props {
    imageList: Array<IImage>
}
defineProps<Props>()
const themeList = reactive(daisyuiThemes)
const router = useRouter()
const { t } = useI18n()

const themeValue = defineModel<string>('themeValue')
const backgroundImageValue = defineModel<object>('backgroundImageValue')
const cardColorValue = defineModel<string>('cardColorValue')
const luckyCardColorValue = defineModel<string>('luckyCardColorValue')
const textColorValue = defineModel<string>('textColorValue')
const patternColorValue = defineModel<string>('patternColorValue')
const cardOpacityValue = defineModel<number>('cardOpacityValue')
</script>

<template>
  <fieldset class="p-6 border-2 fieldset bg-base-200/60 backdrop-blur-sm border-base-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full">
    <legend class="fieldset-legend px-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {{ t('table.themeSetting') }}
    </legend>

    <div class="space-y-6 mt-2">
      <!-- 主题选择 -->
      <div class="w-full form-control">
      <label for="theme-select" class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-primary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.theme') }}</span>
          </div>
      </label>
        <select 
          id="theme-select"
          name="theme-select"
          v-model="themeValue" 
          data-choose-theme 
          class="w-full border-2 border-base-300 select select-bordered focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 cursor-pointer hover:border-primary/50 h-12"
        >
        <option disabled selected>
          {{ t('table.theme') }}
        </option>
        <option v-for="(item, index) in themeList" :key="index" :value="item">
          {{ item }}
        </option>
      </select>
    </div>

      <!-- 背景图片 -->
      <div class="w-full form-control">
      <label for="background-image-select" class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-secondary rounded-full" />
            <span class="label-text text-base font-medium">{{ t('table.backgroundImage') }}</span>
          </div>
      </label>
      <select
          id="background-image-select"
          name="background-image-select"
          v-model="backgroundImageValue" 
          data-choose-theme
          class="w-full border-2 border-base-300 select select-bordered focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 cursor-pointer hover:border-primary/50 truncate h-12"
      >
        <option disabled selected>
          {{ t('table.backgroundImage') }}
        </option>
        <option
            v-for="(item, index) in [{ name: '❌', url: '', id: '' }, ...imageList]" 
            :key="index"
          :value="item"
          :title="item.name"
        >
            {{ item.name }}
        </option>
      </select>
        <span class="label text-xs text-base-content/60 mt-1">
        {{ t('tooltip.pleaseGoto') }}
          <a class="link link-info cursor-pointer hover:link-hover transition-colors duration-200" @click="() => { router.push('image') }">
          {{ t('sidebar.imagesManagement') }}
        </a>
          {{ t('tooltip.uploadImage') }}
        </span>
    </div>

      <!-- 颜色选择器网格 -->
      <div class="grid grid-cols-2 gap-4 w-full">
        <div class="flex flex-col items-start gap-2 form-control p-4 rounded-xl bg-base-300/30 hover:bg-base-300/50 transition-all duration-200">
          <label class="label p-0">
            <span class="label-text font-medium">{{ t('table.cardColor') }}</span>
        </label>
          <div class="w-full flex justify-center">
        <ColorPicker v-model="cardColorValue" v-model:pure-color="cardColorValue" />
      </div>
        </div>
        
        <div class="flex flex-col items-start gap-2 form-control p-4 rounded-xl bg-base-300/30 hover:bg-base-300/50 transition-all duration-200">
          <label class="label p-0">
            <span class="label-text font-medium">{{ t('table.winnerColor') }}</span>
        </label>
          <div class="w-full flex justify-center">
        <ColorPicker v-model="luckyCardColorValue" v-model:pure-color="luckyCardColorValue" />
      </div>
        </div>
        
        <div class="flex flex-col items-start gap-2 form-control p-4 rounded-xl bg-base-300/30 hover:bg-base-300/50 transition-all duration-200">
          <label class="label p-0 flex items-center gap-2">
            <span class="label-text font-medium">{{ t('table.textColor') }}</span>
            <div class="tooltip tooltip-right" data-tip="设置文本颜色会覆盖标题样式">
              <button class="btn btn-circle btn-ghost btn-xs cursor-help hover:bg-base-300" aria-label="帮助信息">
              ?
            </button>
          </div>
        </label>
          <div class="w-full flex justify-center">
        <ColorPicker v-model="textColorValue" v-model:pure-color="textColorValue" />
      </div>
        </div>
        
        <div class="flex flex-col items-start gap-2 form-control p-4 rounded-xl bg-base-300/30 hover:bg-base-300/50 transition-all duration-200">
          <label class="label p-0">
            <span class="label-text font-medium">{{ t('table.highlightColor') }}</span>
        </label>
          <div class="w-full flex justify-center">
        <ColorPicker v-model="patternColorValue" v-model:pure-color="patternColorValue" />
          </div>
        </div>
      </div>

      <!-- 卡片透明度 -->
      <div class="w-full form-control">
        <label class="label">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-accent rounded-full" />
            <span class="label-text text-base font-medium">卡片透明度</span>
          </div>
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="cardOpacityValue"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="range range-primary flex-1"
          />
          <div class="w-20 text-center">
            <span class="text-sm font-semibold">{{ Math.round((cardOpacityValue || 0.5) * 100) }}%</span>
          </div>
        </div>
        <div class="flex justify-between text-xs text-base-content/60 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>

</style>
