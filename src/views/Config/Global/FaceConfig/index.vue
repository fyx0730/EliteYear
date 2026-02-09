<script setup lang='ts'>
import { useI18n } from 'vue-i18n'
import GridWaterfall from '@/components/Waterfall/index.vue'
import { AbilitySetting, DataSetting, LayoutSetting, PatternSetting, TextSetting, ThemeSetting } from './parts'
import { useViewModel } from './useViewModel'

const { t } = useI18n()
const {
    resetData,
    topTitleValue,
    languageValue,
    textSizeValue,
    currentFontValue,
    currentTitleFontValue,
    titleFontSyncGlobalValue,
    languageList,
    formErr,
    formData,
    cardSizeValue,
    isShowPrizeListValue,
    isShowAvatarValue,
    resetPersonLayout,
    isRowCountChange,
    themeValue,
    backgroundImageValue,
    cardColorValue,
    luckyCardColorValue,
    textColorValue,
    patternColorValue,
    imageList,
    rowCount,
    cardColor,
    patternColor,
    patternList,
    clearPattern,
    resetPattern,
    exportAllConfigData,
    importAllConfigData,
    definiteTimeValue,
    isWinMusicValue,
    cardOpacityValue,
} = useViewModel()
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- 页面标题和描述 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
        {{ t('viewTitle.globalSetting') }}
      </h1>
      <p class="text-base-content/70 text-sm">
        配置抽奖系统的外观、主题、布局和功能设置
      </p>
    </div>

    <!-- 设置分组 - 使用卡片网格布局 -->
    <div class="space-y-8">
      <!-- 基础设置组 -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full" />
          <h2 class="text-xl font-semibold">基础设置</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 数据操作 -->
      <DataSetting :reset-data="resetData" :export-all-config-data="exportAllConfigData" :import-all-config-data="importAllConfigData" />
          <!-- 文本设置 -->
      <TextSetting
        v-model:top-title-value="topTitleValue"
        v-model:language-value="languageValue"
        v-model:text-size-value="textSizeValue"
        v-model:current-font-value="currentFontValue"
        v-model:current-title-font-value="currentTitleFontValue"
        v-model:title-font-sync-global-value="titleFontSyncGlobalValue"
        v-model:language-list="languageList"
      />
        </div>
      </section>

      <!-- 视觉设置组 -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-1 h-6 bg-secondary rounded-full" />
          <h2 class="text-xl font-semibold">视觉设置</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- 主题设置 -->
      <ThemeSetting
        v-model:theme-value="themeValue"
        v-model:background-image-value="backgroundImageValue"
        v-model:card-color-value="cardColorValue"
        v-model:lucky-card-color-value="luckyCardColorValue"
        v-model:text-color-value="textColorValue"
        v-model:pattern-color-value="patternColorValue"
        v-model:card-opacity-value="cardOpacityValue"
        :image-list="imageList"
      />
      <!-- 图案设置 -->
      <PatternSetting
        :row-count="rowCount"
        :card-color="cardColor"
        :pattern-color="patternColor"
        :pattern-list="patternList"
        :clear-pattern="clearPattern"
        :reset-pattern="resetPattern"
      />
        </div>
      </section>

      <!-- 布局和功能组 -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-1 h-6 bg-accent rounded-full" />
          <h2 class="text-xl font-semibold">布局与功能</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- 布局设置 -->
          <LayoutSetting
            v-model:form-err="formErr"
            v-model:form-data="formData"
            v-model:card-size-value="cardSizeValue"
            v-model:is-show-prize-list-value="isShowPrizeListValue"
            v-model:is-show-avatar-value="isShowAvatarValue"
            :reset-person-layout="resetPersonLayout"
            :is-row-count-change="isRowCountChange"
          />
      <!-- 功能设置 -->
      <AbilitySetting v-model:definite-time="definiteTimeValue" v-model:win-music="isWinMusicValue" />
        </div>
      </section>
    </div>
  </div>
</template>

<style lang='scss' scoped>
/* 确保所有设置组件高度一致 */
:deep(fieldset) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* Legend 样式优化 - 避免压在边框上 */
:deep(legend) {
  background: hsl(var(--b1));
  padding: 0.25rem 1rem;
  margin-left: 0.5rem;
  border-radius: 0.5rem;
}

/* 分组标题动画 */
section h2 {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 分组区域渐入动画 */
section:nth-child(1) {
  animation: fadeIn 0.4s ease-out;
}

section:nth-child(2) {
  animation: fadeIn 0.6s ease-out;
}

section:nth-child(3) {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
