<script setup lang='ts'>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
    addTemporaryPrize: () => void
}>()
const { t } = useI18n()
const prizeShow = defineModel('prizeShow', {
    type: Boolean,
    default: false,
})

// 动画状态，用于控制tooltip显示
const isAnimating = ref(false)
</script>

<template>
  <transition 
    name="prize-operate" 
    mode="out-in" 
    :appear="true"
    @before-enter="isAnimating = true"
    @after-enter="isAnimating = false"
    @before-leave="isAnimating = true"
    @after-leave="isAnimating = false"
  >
    <div v-if="prizeShow" key="show" class="flex flex-col gap-3 operate-wrapper" :class="{ 'is-animating': isAnimating }">
        <div class="tooltip tooltip-right" :data-tip="t('tooltip.prizeList')">
          <div
          class="flex items-center w-6 h-8 rounded-r-lg cursor-pointer prize-option bg-slate-500/50 hover:bg-slate-500/70 transition-colors duration-200"
            @click="prizeShow = !prizeShow"
          >
            <svg-icon name="arrow_left" class="w-full h-full" />
          </div>
        </div>
        <div class="tooltip tooltip-right" :data-tip="t('tooltip.addActivity')">
          <div
          class="flex items-center w-6 h-8 rounded-r-lg cursor-pointer prize-option bg-slate-500/50 hover:bg-slate-500/70 transition-colors duration-200"
            @click="addTemporaryPrize"
          >
            <svg-icon name="add" class="w-full h-full" />
          </div>
        </div>
      </div>
    <div 
      v-else 
      key="hide" 
      class="tooltip tooltip-right operate-wrapper" 
      :class="{ 'is-animating': isAnimating }"
      :data-tip="t('tooltip.prizeList')"
    >
        <div
        class="flex items-center w-6 h-8 rounded-r-lg cursor-pointer prize-option bg-slate-500/50 hover:bg-slate-500/70 transition-colors duration-200"
          @click="prizeShow = !prizeShow"
        >
          <svg-icon name="arrow_right" class="w-full h-full" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 硬件加速优化，消除残影 */
.prize-option {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 动画期间禁用所有 tooltip */
.is-animating.tooltip::before,
.is-animating.tooltip::after,
.is-animating .tooltip::before,
.is-animating .tooltip::after {
  content: none !important;
}
</style>
